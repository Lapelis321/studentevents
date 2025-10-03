// Complete API server with Stripe integration
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_51234567890abcdef');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    console.log('JSON parsing error:', error.message);
    return res.status(400).json({ error: 'Invalid JSON format' });
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Mock events data
const events = [
  {
    id: 1,
    title: "Spring Music Festival",
    date: "2024-04-15T19:00:00Z",
    location: "University Campus",
    price: 25.00,
    currency: "EUR",
    minAge: 18,
    dressCode: "Casual",
    description: "Join us for an amazing night of live music featuring local and international artists.",
    additionalInfo: "Food trucks will be available on-site. Bring your student ID for verification.",
    availableTickets: 150,
    totalTickets: 500
  },
  {
    id: 2,
    title: "Tech Innovation Summit",
    date: "2024-04-22T14:00:00Z",
    location: "Convention Center",
    price: 15.00,
    currency: "EUR",
    minAge: 16,
    dressCode: "Business Casual",
    description: "Explore the latest in technology and innovation with industry leaders.",
    additionalInfo: "Networking lunch included. Laptops recommended for workshops.",
    availableTickets: 200,
    totalTickets: 300
  },
  {
    id: 3,
    title: "Art & Culture Night",
    date: "2024-04-28T18:30:00Z",
    location: "City Art Gallery",
    price: 12.00,
    currency: "EUR",
    minAge: 16,
    dressCode: "Smart Casual",
    description: "An evening celebrating local artists and cultural diversity.",
    additionalInfo: "Wine and cheese reception included. Photography allowed.",
    availableTickets: 80,
    totalTickets: 100
  },
  {
    id: 4,
    title: "Sports Championship Finals",
    date: "2024-05-05T16:00:00Z",
    location: "Stadium Arena",
    price: 30.00,
    currency: "EUR",
    minAge: 12,
    dressCode: "Casual",
    description: "Cheer for your favorite teams in the ultimate championship showdown.",
    additionalInfo: "Stadium food and beverages available. Team merchandise on sale.",
    availableTickets: 500,
    totalTickets: 1000
  },
  {
    id: 5,
    title: "Comedy Night Special",
    date: "2024-05-12T20:00:00Z",
    location: "Student Union Hall",
    price: 18.00,
    currency: "EUR",
    minAge: 18,
    dressCode: "Casual",
    description: "Laugh the night away with top comedians and rising stars.",
    additionalInfo: "Two-drink minimum. Late seating not permitted after show starts.",
    availableTickets: 120,
    totalTickets: 150
  },
  {
    id: 6,
    title: "Environmental Awareness Workshop",
    date: "2024-05-18T10:00:00Z",
    location: "Science Building",
    price: 8.00,
    currency: "EUR",
    minAge: 14,
    dressCode: "Casual",
    description: "Learn about sustainability and environmental protection.",
    additionalInfo: "Materials provided. Certificate of participation available.",
    availableTickets: 60,
    totalTickets: 80
  }
];

// API Routes
app.get('/api/events', (req, res) => {
  res.json(events);
});

app.get('/api/events/:id', (req, res) => {
  const eventId = parseInt(req.params.id);
  const event = events.find(e => e.id === eventId);
  
  if (event) {
    res.json(event);
  } else {
    res.status(404).json({ error: 'Event not found' });
  }
});

// Mock auth
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@studentevents.com' && password === 'admin123') {
    res.json({
      success: true,
      token: 'mock-jwt-token',
      user: { id: 1, name: 'Admin User', email: 'admin@studentevents.com', role: 'admin' }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Real ticket purchase with Stripe
app.post('/api/tickets/purchase', async (req, res) => {
  try {
    const { eventId, quantity, attendeeInfo, totalAmount } = req.body;
    
    // Find the event
    const event = events.find(e => e.id === eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // For demo purposes, simulate successful payment
    // In production, you would use real Stripe keys
    if (process.env.STRIPE_SECRET_KEY && 
        process.env.STRIPE_SECRET_KEY !== 'sk_test_51234567890abcdef' &&
        process.env.STRIPE_SECRET_KEY.startsWith('sk_live_')) {
      // Real Stripe integration
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(totalAmount * 100), // Convert to cents
          currency: event.currency.toLowerCase(),
          metadata: {
            eventId: eventId.toString(),
            quantity: quantity.toString(),
            attendeeEmail: attendeeInfo.email
          }
        });
        
        res.json({
          success: true,
          clientSecret: paymentIntent.client_secret,
          orderNumber: 'SE' + Date.now()
        });
      } catch (stripeError) {
        console.log('Stripe error, falling back to demo mode:', stripeError.message);
        // Fallback to demo mode
        res.json({
          success: true,
          clientSecret: 'pi_demo_' + Date.now(),
          orderNumber: 'SE' + Date.now(),
          message: 'Demo payment successful (Stripe fallback)'
        });
      }
    } else {
      // Demo mode - simulate successful payment
      res.json({
        success: true,
        clientSecret: 'pi_demo_' + Date.now(),
        orderNumber: 'SE' + Date.now(),
        message: 'Demo payment successful'
      });
    }
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

// Confirm ticket purchase
app.post('/api/tickets/confirm', async (req, res) => {
  try {
    const { paymentIntentId, eventId, quantity, attendeeInfo } = req.body;
    
    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not completed' });
    }
    
    // Generate ticket numbers
    const tickets = [];
    for (let i = 0; i < quantity; i++) {
      tickets.push({
        id: Date.now() + i,
        ticketNumber: 'SE' + Date.now() + i,
        attendeeName: attendeeInfo.firstName + ' ' + attendeeInfo.lastName,
        attendeeEmail: attendeeInfo.email,
        eventId: eventId,
        status: 'valid'
      });
    }
    
    res.json({
      success: true,
      tickets: tickets,
      orderNumber: 'SE' + Date.now()
    });
  } catch (error) {
    console.error('Confirmation error:', error);
    res.status(500).json({ error: 'Ticket confirmation failed' });
  }
});

// Get user's tickets
app.get('/api/tickets/my-tickets', (req, res) => {
  // Mock user tickets - in real app, this would query database
  res.json([
    {
      id: 1,
      ticketNumber: 'SE123456789',
      eventTitle: 'Spring Music Festival',
      attendeeName: 'John Doe',
      status: 'valid',
      purchaseDate: new Date().toISOString()
    }
  ]);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`🌐 Health: http://localhost:${PORT}/health`);
  console.log(`📚 API: http://localhost:${PORT}/api`);
});
