// =====================================================
// PAYMENTS ROUTES
// =====================================================

const express = require('express');
const router = express.Router();

// Initialize Stripe (only if secret key is provided)
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;

// =====================================================
// POST /api/payments/create-checkout-session - Create Stripe checkout
// =====================================================
router.post('/create-checkout-session', async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe not configured' });
  }
  
  const pool = req.app.locals.pool;
  
  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const { booking_id } = req.body;
    
    if (!booking_id) {
      return res.status(400).json({ error: 'Booking ID required' });
    }
    
    // Get booking details
    const bookingResult = await pool.query(
      `SELECT b.*, e.name as event_name 
       FROM bookings b 
       LEFT JOIN events e ON b.event_id = e.id
       WHERE b.id = $1`,
      [booking_id]
    );
    
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    const booking = bookingResult.rows[0];
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: process.env.SYSTEM_CURRENCY || 'eur',
            product_data: {
              name: booking.event_name,
              description: `${booking.quantity} ticket(s) for ${booking.first_name} ${booking.last_name}`
            },
            unit_amount: Math.round(parseFloat(booking.total_amount) * 100) // Convert to cents
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/confirmation.html?booking_id=${booking_id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout.html?event_id=${booking.event_id}`,
      customer_email: booking.email,
      metadata: {
        booking_id: booking.id,
        ticket_number: booking.ticket_number
      }
    });
    
    res.json({
      sessionId: session.id,
      url: session.url
    });
    
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// =====================================================
// POST /api/payments/webhook - Stripe webhook handler
// =====================================================
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe not configured' });
  }
  
  const pool = req.app.locals.pool;
  
  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('Stripe webhook secret not configured');
    return res.status(400).json({ error: 'Webhook not configured' });
  }
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }
  
  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Update booking status to paid
    const bookingId = session.metadata.booking_id;
    
    if (bookingId) {
      try {
        await pool.query(
          `UPDATE bookings 
           SET payment_status = 'paid', 
               payment_method = 'stripe',
               updated_at = NOW()
           WHERE id = $1`,
          [bookingId]
        );
        
        console.log(`✅ Booking ${bookingId} marked as paid via Stripe`);
        
        // TODO: Send confirmation email with tickets
        
      } catch (error) {
        console.error('Error updating booking after Stripe payment:', error);
      }
    }
  }
  
  res.json({ received: true });
});

// =====================================================
// GET /api/payments/bank-details - Get bank transfer details
// =====================================================
router.get('/bank-details', async (req, res) => {
  const pool = req.app.locals.pool;
  
  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    // Fetch bank transfer settings from database
    const result = await pool.query(
      `SELECT key, value FROM settings 
       WHERE key IN ('bank_recipient_name', 'bank_iban', 'bank_transfer_deadline_hours')`
    );
    
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    
    res.json({
      recipient: settings.bank_recipient_name || 'StudentEvents Organization',
      iban: settings.bank_iban || 'LT000000000000000000',
      deadlineHours: parseInt(settings.bank_transfer_deadline_hours) || 24
    });
    
  } catch (error) {
    console.error('Error fetching bank details:', error);
    res.status(500).json({ error: 'Failed to fetch bank details' });
  }
});

module.exports = router;


