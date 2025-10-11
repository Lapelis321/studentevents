# Backend API Code for Bank Transfer System

**Add these endpoints to `backend/railway-server.js`**

Insert after the existing API endpoints (around line 280):

```javascript
// ========================================
// SETTINGS API ENDPOINTS
// ========================================

// GET /api/settings - Get all settings (public)
app.get('/api/settings', async (req, res) => {
  try {
    if (pool) {
      const result = await pool.query('SELECT key, value FROM settings ORDER BY category, key');
      const settings = {};
      result.rows.forEach(row => {
        settings[row.key] = row.value;
      });
      res.json(settings);
    } else {
      // Fallback settings
      res.json({
        bank_recipient_name: 'ISM Events Organization',
        bank_iban: 'LT12 3456 7890 1234 5678',
        base_ticket_price: '20.00',
        ism_student_discount: '1.00',
        support_email: 'support@studentevents.com',
        payment_deadline_hours: '24'
      });
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/admin/settings/:key - Update setting (admin only)
app.put('/api/admin/settings/:key', verifyAdminToken, async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (!pool) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const result = await pool.query(`
      UPDATE settings 
      SET value = $1, updated_at = NOW(), updated_by = $2
      WHERE key = $3
      RETURNING *
    `, [value, req.user.email, key]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

// ========================================
// BOOKINGS API ENDPOINTS
// ========================================

// POST /api/bookings - Create booking
app.post('/api/bookings', async (req, res) => {
  try {
    const {
      eventId,
      firstName,
      lastName,
      email,
      phone,
      isISMStudent,
      quantity
    } = req.body;

    // Validate required fields
    if (!eventId || !firstName || !lastName || !email || !phone || !quantity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!pool) {
      return res.status(503).json({ error: 'Database not available' });
    }

    // Get event details
    const eventResult = await pool.query('SELECT * FROM events WHERE id = $1', [eventId]);
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    const event = eventResult.rows[0];

    // Get settings
    const settingsResult = await pool.query('SELECT key, value FROM settings');
    const settings = {};
    settingsResult.rows.forEach(row => {
      settings[row.key] = row.value;
    });

    // Calculate pricing
    const basePrice = parseFloat(event.price);
    const discount = isISMStudent ? 0 : parseFloat(settings.ism_student_discount || '1.00');
    const unitPrice = basePrice;
    const totalAmount = (basePrice + discount) * quantity;

    // Generate unique payment reference
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    const paymentReference = `TICKET-${timestamp}-${random}`;

    // Calculate payment deadline
    const deadlineHours = parseInt(settings.payment_deadline_hours || '24');
    const paymentDeadline = new Date(Date.now() + deadlineHours * 60 * 60 * 1000);

    // Create booking
    const bookingResult = await pool.query(`
      INSERT INTO bookings (
        event_id, first_name, last_name, email, phone,
        is_ism_student, quantity, unit_price, discount,
        total_amount, payment_reference, payment_deadline
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      eventId, firstName, lastName, email, phone,
      isISMStudent, quantity, unitPrice, discount,
      totalAmount, paymentReference, paymentDeadline
    ]);

    const booking = bookingResult.rows[0];

    // Prepare response with bank details
    const response = {
      booking,
      event,
      bankDetails: {
        recipient: settings.bank_recipient_name || 'ISM Events Organization',
        iban: settings.bank_iban || 'LT12 3456 7890 1234 5678',
        amount: totalAmount.toFixed(2),
        reference: paymentReference
      }
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// GET /api/admin/bookings - Get all bookings (admin only)
app.get('/api/admin/bookings', verifyAdminToken, async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const result = await pool.query(`
      SELECT 
        b.*,
        e.title as event_title,
        e.date as event_date
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      ORDER BY b.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// GET /api/admin/bookings/:id - Get single booking (admin only)
app.get('/api/admin/bookings/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!pool) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const result = await pool.query(`
      SELECT 
        b.*,
        e.title as event_title,
        e.date as event_date,
        e.location as event_location
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      WHERE b.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// POST /api/admin/bookings/:id/confirm - Confirm payment (admin only)
app.post('/api/admin/bookings/:id/confirm', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!pool) {
      return res.status(503).json({ error: 'Database not available' });
    }

    // Update booking status
    const updateResult = await pool.query(`
      UPDATE bookings 
      SET payment_status = 'paid', paid_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND payment_status = 'pending'
      RETURNING *
    `, [id]);

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found or already paid' });
    }

    const booking = updateResult.rows[0];

    // Get event details
    const eventResult = await pool.query('SELECT * FROM events WHERE id = $1', [booking.event_id]);
    const event = eventResult.rows[0];

    // Generate tickets with QR codes
    const tickets = [];
    for (let i = 0; i < booking.quantity; i++) {
      const ticketNumber = `${booking.payment_reference}-${i + 1}`;
      const qrData = await QRCode.toDataURL(ticketNumber);

      const ticketResult = await pool.query(`
        INSERT INTO tickets (
          event_id, booking_id, email, ticket_number,
          qr_code, status, issued_at
        ) VALUES ($1, $2, $3, $4, $5, 'active', NOW())
        RETURNING *
      `, [
        booking.event_id,
        booking.id,
        booking.email,
        ticketNumber,
        qrData
      ]);

      tickets.push(ticketResult.rows[0]);
    }

    // Send email with tickets (if SendGrid configured)
    if (sgMail && process.env.SENDGRID_API_KEY) {
      try {
        await sendTicketEmail(booking, event, tickets);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.json({
      success: true,
      booking,
      tickets,
      emailSent: !!(sgMail && process.env.SENDGRID_API_KEY)
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Helper function for sending ticket emails
async function sendTicketEmail(booking, event, tickets) {
  const qrCodesHtml = tickets.map(ticket => `
    <div style="margin: 20px 0; padding: 20px; border: 2px solid #6366f1; border-radius: 8px;">
      <p style="margin: 0 0 10px;"><strong>Ticket ${tickets.indexOf(ticket) + 1} of ${tickets.length}</strong></p>
      <p style="margin: 0 0 10px;">Ticket Number: <code>${ticket.ticket_number}</code></p>
      <img src="${ticket.qr_code}" alt="QR Code" style="width: 200px; height: 200px;" />
    </div>
  `).join('');

  const msg = {
    to: booking.email,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@studentevents.com',
    subject: `Your Tickets for ${event.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">Your Tickets Are Ready!</h1>
        <p>Hi ${booking.first_name},</p>
        <p>Your payment has been confirmed! Here are your tickets for <strong>${event.title}</strong>.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">Event Details</h2>
          <p><strong>Event:</strong> ${event.title}</p>
          <p><strong>Date:</strong> ${new Date(event.date).toLocaleString()}</p>
          <p><strong>Location:</strong> ${event.location}</p>
          <p><strong>Tickets:</strong> ${booking.quantity}</p>
        </div>

        <h2>Your Tickets:</h2>
        ${qrCodesHtml}

        <div style="margin-top: 30px; padding: 20px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
          <p style="margin: 0;"><strong>Important:</strong> Please bring these QR codes (digital or printed) to the event for entry.</p>
        </div>

        <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
          Questions? Contact us at ${process.env.SUPPORT_EMAIL || 'support@studentevents.com'}
        </p>
      </div>
    `
  };

  await sgMail.send(msg);
}
```

---

## 🚀 **HOW TO ADD THIS TO BACKEND**

1. Open `backend/railway-server.js`
2. Find line ~280 (after existing event endpoints)
3. Copy/paste the entire code above
4. Save file
5. Commit and push

---

## ✅ **WHAT THIS ENABLES**

- ✅ Settings API (get/update bank details)
- ✅ Bookings API (create booking)
- ✅ Admin bookings list
- ✅ Admin payment confirmation
- ✅ Auto ticket generation
- ✅ Email sending (if SendGrid configured)

---

**This is the critical backend code needed for the system to function!**

