// =====================================================
// BOOKINGS ROUTES
// =====================================================

const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

// Helper function to generate ticket number
function generateTicketNumber(prefix = 'TICKET') {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// Helper function to generate payment reference
function generatePaymentReference() {
  return 'PAY-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// =====================================================
// GET /api/bookings - List all bookings (admin only)
// =====================================================
router.get('/', requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  
  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const { event_id, status, limit, offset } = req.query;
    
    let query = `
      SELECT b.*, e.name as event_name, e.date as event_date 
      FROM bookings b 
      LEFT JOIN events e ON b.event_id = e.id
    `;
    const params = [];
    const conditions = [];
    
    // Filter by event
    if (event_id) {
      conditions.push(`b.event_id = $${params.length + 1}`);
      params.push(event_id);
    }
    
    // Filter by payment status
    if (status) {
      conditions.push(`b.payment_status = $${params.length + 1}`);
      params.push(status);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY b.created_at DESC';
    
    // Pagination
    if (limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(parseInt(limit));
    }
    
    if (offset) {
      query += ` OFFSET $${params.length + 1}`;
      params.push(parseInt(offset));
    }
    
    const result = await pool.query(query, params);
    
    res.json(result.rows);
    
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// =====================================================
// GET /api/bookings/search - Search bookings (admin only)
// =====================================================
router.get('/search', requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  
  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }
    
    const result = await pool.query(
      `SELECT b.*, e.name as event_name, e.date as event_date 
       FROM bookings b 
       LEFT JOIN events e ON b.event_id = e.id
       WHERE 
         b.first_name ILIKE $1 OR 
         b.last_name ILIKE $1 OR 
         b.email ILIKE $1 OR 
         b.phone ILIKE $1 OR 
         b.ticket_number ILIKE $1
       ORDER BY b.created_at DESC
       LIMIT 50`,
      [`%${q}%`]
    );
    
    res.json(result.rows);
    
  } catch (error) {
    console.error('Error searching bookings:', error);
    res.status(500).json({ error: 'Failed to search bookings' });
  }
});

// =====================================================
// GET /api/bookings/:id - Get single booking
// =====================================================
router.get('/:id', async (req, res) => {
  const pool = req.app.locals.pool;
  
  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT b.*, e.name as event_name, e.date as event_date, e.location as event_location
       FROM bookings b 
       LEFT JOIN events e ON b.event_id = e.id
       WHERE b.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(result.rows[0]);
    
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// =====================================================
// POST /api/bookings - Create booking (public)
// =====================================================
router.post('/', async (req, res) => {
  const pool = req.app.locals.pool;
  
  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const {
      event_id,
      first_name,
      last_name,
      email,
      phone,
      quantity,
      payment_method,
      additional_attendees
    } = req.body;
    
    // Validate required fields
    if (!event_id || !first_name || !last_name || !email || !phone || !quantity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Get event details
    const eventResult = await pool.query(
      'SELECT * FROM events WHERE id = $1',
      [event_id]
    );
    
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const event = eventResult.rows[0];
    
    // Check ticket availability
    const availableTickets = event.total_tickets - event.sold_tickets;
    if (quantity > availableTickets) {
      return res.status(400).json({ 
        error: 'Not enough tickets available',
        available: availableTickets
      });
    }
    
    // Calculate total amount
    const totalAmount = event.price * quantity;
    
    // Generate ticket number and payment reference
    const ticketNumber = generateTicketNumber(process.env.TICKET_NUMBER_PREFIX);
    const paymentReference = generatePaymentReference();
    
    // Calculate payment deadline (24 hours for bank transfer)
    const paymentDeadline = new Date();
    paymentDeadline.setHours(paymentDeadline.getHours() + 24);
    
    // Create booking
    const result = await pool.query(
      `INSERT INTO bookings 
      (event_id, ticket_number, first_name, last_name, email, phone, quantity, total_amount, 
       payment_method, payment_reference, payment_deadline, additional_attendees, payment_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        event_id,
        ticketNumber,
        first_name,
        last_name,
        email,
        phone,
        quantity,
        totalAmount,
        payment_method || 'bank-transfer',
        paymentReference,
        paymentDeadline,
        JSON.stringify(additional_attendees || []),
        'pending'
      ]
    );
    
    const booking = result.rows[0];
    
    // Return booking with event details
    res.status(201).json({
      message: 'Booking created successfully',
      booking: {
        ...booking,
        event: {
          id: event.id,
          name: event.name,
          date: event.date,
          location: event.location
        }
      }
    });
    
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// =====================================================
// PUT /api/bookings/:id - Update booking (admin only)
// =====================================================
router.put('/:id', requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  
  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      email,
      phone,
      payment_status,
      additional_attendees
    } = req.body;
    
    // Check if booking exists
    const checkResult = await pool.query(
      'SELECT id FROM bookings WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    const result = await pool.query(
      `UPDATE bookings 
      SET first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          email = COALESCE($3, email),
          phone = COALESCE($4, phone),
          payment_status = COALESCE($5, payment_status),
          additional_attendees = COALESCE($6, additional_attendees),
          updated_at = NOW()
      WHERE id = $7
      RETURNING *`,
      [first_name, last_name, email, phone, payment_status, 
       additional_attendees ? JSON.stringify(additional_attendees) : null, id]
    );
    
    res.json({
      message: 'Booking updated successfully',
      booking: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// =====================================================
// DELETE /api/bookings/:id - Delete booking (admin only)
// =====================================================
router.delete('/:id', requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  
  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM bookings WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json({
      message: 'Booking deleted successfully',
      booking: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

// =====================================================
// POST /api/bookings/:id/confirm - Confirm payment (admin only)
// =====================================================
router.post('/:id/confirm', requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  
  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const { id } = req.params;
    
    // Update booking status to paid
    const result = await pool.query(
      `UPDATE bookings 
      SET payment_status = 'paid', updated_at = NOW()
      WHERE id = $1
      RETURNING *`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    const booking = result.rows[0];
    
    // TODO: Send email with tickets
    // This will be implemented in the email service
    
    res.json({
      message: 'Payment confirmed successfully',
      booking,
      emailSent: false, // Will be true when email service is implemented
      note: 'Email service not yet configured'
    });
    
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// =====================================================
// POST /api/bookings/manual - Create booking manually (admin only)
// =====================================================
router.post('/manual', requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  
  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const {
      event_id,
      first_name,
      last_name,
      email,
      phone,
      quantity,
      payment_status,
      payment_method
    } = req.body;
    
    // Validate required fields
    if (!event_id || !first_name || !last_name || !email || !phone || !quantity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Get event details
    const eventResult = await pool.query(
      'SELECT * FROM events WHERE id = $1',
      [event_id]
    );
    
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const event = eventResult.rows[0];
    
    // Check ticket availability
    const availableTickets = event.total_tickets - event.sold_tickets;
    if (quantity > availableTickets) {
      return res.status(400).json({ 
        error: 'Not enough tickets available',
        available: availableTickets
      });
    }
    
    // Calculate total amount
    const total_amount = event.price * quantity;
    
    // Generate ticket number
    const ticket_number = generateTicketNumber();
    
    // Generate payment reference
    const payment_reference = generatePaymentReference();
    
    // Create booking with manual payment status (default to 'paid' if not specified)
    const finalPaymentStatus = payment_status || 'paid';
    const finalPaymentMethod = payment_method || 'manual';
    
    const result = await pool.query(
      `INSERT INTO bookings (
        event_id, ticket_number, first_name, last_name, email, phone, 
        quantity, total_amount, payment_status, payment_method, payment_reference
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        event_id, ticket_number, first_name, last_name, email, phone,
        quantity, total_amount, finalPaymentStatus, finalPaymentMethod, payment_reference
      ]
    );
    
    const booking = result.rows[0];
    
    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
    
  } catch (error) {
    console.error('Error creating manual booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// =====================================================
// GET /api/bookings/:id/ticket - Download ticket as PDF
// =====================================================
router.get('/:id/ticket', async (req, res) => {
  const pool = req.app.locals.pool;
  
  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const { id } = req.params;
    
    // Get booking with event details
    const result = await pool.query(
      `SELECT b.*, e.name as event_name, e.date as event_date, 
              e.location as event_location, e.image_url as event_image
       FROM bookings b
       LEFT JOIN events e ON b.event_id = e.id
       WHERE b.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    const booking = result.rows[0];
    
    // Generate QR code
    const qrData = JSON.stringify({
      booking_id: booking.id,
      ticket_number: booking.ticket_number,
      event_id: booking.event_id
    });
    
    const qrCodeDataURL = await QRCode.toDataURL(qrData, { width: 200, margin: 1 });
    
    // Create PDF
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ticket-${booking.ticket_number}.pdf`);
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // Add header
    doc.fontSize(28)
       .font('Helvetica-Bold')
       .fillColor('#4F46E5')
       .text('EVENT TICKET', { align: 'center' });
    
    doc.moveDown(0.5);
    
    // Event name
    doc.fontSize(20)
       .fillColor('#000')
       .text(booking.event_name, { align: 'center' });
    
    doc.moveDown(1.5);
    
    // Add QR code
    const qrImageBuffer = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');
    doc.image(qrImageBuffer, (doc.page.width - 150) / 2, doc.y, { width: 150 });
    
    doc.moveDown(10);
    
    // Ticket details
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Ticket Details', { underline: true });
    
    doc.moveDown(0.5);
    
    doc.fontSize(10)
       .font('Helvetica');
    
    doc.text(`Ticket Number: ${booking.ticket_number}`);
    doc.text(`Name: ${booking.first_name} ${booking.last_name}`);
    doc.text(`Email: ${booking.email}`);
    doc.text(`Phone: ${booking.phone}`);
    doc.text(`Quantity: ${booking.quantity} ticket(s)`);
    doc.text(`Amount: €${booking.total_amount}`);
    doc.text(`Payment Status: ${booking.payment_status.toUpperCase()}`);
    
    doc.moveDown(1);
    
    // Event details
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Event Details', { underline: true });
    
    doc.moveDown(0.5);
    
    doc.fontSize(10)
       .font('Helvetica');
    
    const eventDate = new Date(booking.event_date);
    doc.text(`Date: ${eventDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`);
    doc.text(`Location: ${booking.event_location}`);
    
    // Add watermark if payment is pending
    if (booking.payment_status === 'pending') {
      doc.fontSize(40)
         .font('Helvetica-Bold')
         .fillColor('#DC2626')
         .opacity(0.3)
         .rotate(-45, { origin: [doc.page.width / 2, doc.page.height / 2] })
         .text('PENDING PAYMENT', 50, doc.page.height / 2 - 50, { align: 'center' })
         .rotate(45, { origin: [doc.page.width / 2, doc.page.height / 2] })
         .opacity(1);
    }
    
    // Footer
    doc.fontSize(8)
       .fillColor('#666')
       .text('StudentEvents - Thank you for your purchase!', 50, doc.page.height - 50, { align: 'center' });
    
    // Finalize PDF
    doc.end();
    
  } catch (error) {
    console.error('Error generating ticket:', error);
    res.status(500).json({ error: 'Failed to generate ticket' });
  }
});

// =====================================================
// GET /api/bookings/export/:event_id - Export participants (admin only)
// =====================================================
router.get('/export/:event_id', requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool;
  
  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const { event_id } = req.params;
    
    const result = await pool.query(
      `SELECT b.*, e.name as event_name 
       FROM bookings b 
       LEFT JOIN events e ON b.event_id = e.id
       WHERE b.event_id = $1 
       ORDER BY b.created_at DESC`,
      [event_id]
    );
    
    // Return as CSV
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=participants-${event_id}.csv`);
    
    const csvHeader = 'Ticket Number,First Name,Last Name,Email,Phone,Quantity,Total Amount,Payment Status,Created At\n';
    const csvRows = result.rows.map(booking => 
      `${booking.ticket_number},"${booking.first_name}","${booking.last_name}",${booking.email},${booking.phone},${booking.quantity},${booking.total_amount},${booking.payment_status},${booking.created_at}`
    ).join('\n');
    
    res.send(csvHeader + csvRows);
    
  } catch (error) {
    console.error('Error exporting participants:', error);
    res.status(500).json({ error: 'Failed to export participants' });
  }
});

module.exports = router;


