// Clean Railway production server
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const sgMail = require('@sendgrid/mail');
const PDFDocument = require('pdfkit');

// Initialize SendGrid if API key is provided
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Initialize Stripe if secret key is provided
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8000';

// Middleware
app.use(cors({
  origin: [
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'https://afterstate.events',
    'https://www.afterstate.events',
    'https://afterstateevents.netlify.app',
    'https://afterstateevents.vercel.app',
    FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const pool = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Always use SSL for production databases
}) : null;

// PDF Generation function for tickets - matches frontend exactly
async function generateTicketPDF(ticketData) {
  return new Promise((resolve, reject) => {
    try {
      console.log('🔍 Generating PDF ticket for:', ticketData.ticketNumber);
      const doc = new PDFDocument({
        size: 'A4',
        margin: 20
      });
      
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData.toString('base64'));
      });
      
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      
      // Add subtle border (matches frontend)
      doc.rect(5, 5, pageWidth - 10, pageHeight - 10)
         .strokeColor('#c8c8c8')
         .lineWidth(0.5)
         .stroke();
      
      // Header (matches frontend exactly)
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .text('STUDENT EVENTS', pageWidth / 2, 25, { align: 'center' });
      
      doc.fontSize(16)
         .font('Helvetica')
         .text('E-TICKET', pageWidth / 2, 35, { align: 'center' });
      
      // Event Details (matches frontend layout)
      let yPos = 50;
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('EVENT DETAILS', 15, yPos);
      
      yPos += 8;
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .text(ticketData.eventTitle || 'Event Name', 15, yPos);
      
      yPos += 7;
      doc.fontSize(10)
         .font('Helvetica');
      const eventDate = new Date(ticketData.eventDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.text(`Date: ${eventDate}`, 15, yPos);
      
      if (ticketData.eventTime && ticketData.eventTime !== 'TBD') {
        yPos += 5;
        doc.text(`Time: ${ticketData.eventTime}`, 15, yPos);
      }
      
      yPos += 5;
      doc.text(`Location: ${ticketData.eventLocation || 'TBD'}`, 15, yPos);
      
      if (ticketData.eventMinAge) {
        yPos += 5;
        doc.text(`Age Restriction: ${ticketData.eventMinAge}+`, 15, yPos);
      }
      
      if (ticketData.eventDressCode) {
        yPos += 5;
        doc.text(`Dress Code: ${ticketData.eventDressCode}`, 15, yPos);
      }
      
      // Attendee Information (matches frontend)
      yPos += 12;
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('ATTENDEE INFORMATION', 15, yPos);
      
      yPos += 8;
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Name: ${ticketData.attendeeName}`, 15, yPos);
      
      yPos += 5;
      doc.text(`Email: ${ticketData.attendeeEmail}`, 15, yPos);
      
      yPos += 5;
      doc.text(`Phone: ${ticketData.attendeePhone}`, 15, yPos);
      
      yPos += 5;
      doc.text(`Tickets: ${ticketData.quantity || 1}`, 15, yPos);
      
      yPos += 5;
      doc.font('Helvetica-Bold')
         .text(`Total Amount: €${ticketData.totalAmount || '0.00'}`, 15, yPos);
      
      // Ticket Number & QR Code (matches frontend)
      yPos += 12;
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('TICKET NUMBER', 15, yPos);
      
      yPos += 8;
      doc.fontSize(12)
         .font('Helvetica')
         .text(ticketData.ticketNumber, 15, yPos);
      
      // Add QR Code (matches frontend positioning)
      if (ticketData.qrCode) {
        try {
          // Convert base64 QR code to image
          const qrImage = ticketData.qrCode.replace(/^data:image\/png;base64,/, '');
          const qrBuffer = Buffer.from(qrImage, 'base64');
          
          // Position QR code on the right side, similar to frontend
          const qrX = pageWidth - 60;
          const qrY = yPos - 10;
          const qrSize = 40;
          
          doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });
          
          // Add QR code label
          doc.fontSize(8)
             .text('QR CODE', qrX + qrSize/2, qrY + qrSize + 5, { align: 'center' });
        } catch (error) {
          console.error('Error adding QR code to PDF:', error);
          // Add fallback text if QR code fails
          doc.fontSize(8)
             .text('QR Code: ' + ticketData.ticketNumber, pageWidth - 60, yPos + 20);
        }
      }
      
      // Small note at bottom (matches frontend)
      yPos = pageHeight - 45;
      doc.fontSize(7)
         .text('Note: This ticket is only valid after payment confirmation.', pageWidth / 2, yPos, { align: 'center' });
      
      // Footer (matches frontend)
      yPos = pageHeight - 30;
      doc.fontSize(8)
         .text('For support, please contact: afterstate.events@gmail.com or +37063849474', pageWidth / 2, yPos, { align: 'center' });
      yPos += 5;
      doc.text('A valid ticket is required for event entry', pageWidth / 2, yPos, { align: 'center' });
      
      doc.end();
      
    } catch (error) {
      reject(error);
    }
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'production',
    database: process.env.DATABASE_URL ? 'connected' : 'mock'
  });
});

// Test endpoint to check bookings data structure (no auth required for debugging)
app.get('/api/test/bookings', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ error: 'Database not available' });
    }

    console.log('🔍 Test endpoint: Fetching bookings data structure');
    
    const result = await pool.query(`
      SELECT 
        b.id,
        b.payment_reference,
        b.first_name,
        b.last_name,
        b.email,
        b.quantity,
        b.additional_attendees,
        e.title as event_title
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      ORDER BY b.created_at DESC
      LIMIT 5
    `);

    console.log('🔍 Test endpoint: Found', result.rows.length, 'bookings');
    
    // Log each booking's additional_attendees data
    result.rows.forEach((booking, index) => {
      console.log(`🔍 Booking ${index + 1}:`, {
        reference: booking.payment_reference,
        quantity: booking.quantity,
        additional_attendees: booking.additional_attendees,
        parsed: booking.additional_attendees ? JSON.parse(booking.additional_attendees) : null
      });
    });

    res.json({
      success: true,
      count: result.rows.length,
      bookings: result.rows.map(booking => ({
        id: booking.id,
        reference: booking.payment_reference,
        primary_contact: `${booking.first_name} ${booking.last_name}`,
        email: booking.email,
        quantity: booking.quantity,
        event: booking.event_title,
        additional_attendees_raw: booking.additional_attendees,
        additional_attendees_parsed: booking.additional_attendees ? JSON.parse(booking.additional_attendees) : [],
        has_additional_attendees: booking.additional_attendees && booking.additional_attendees !== '[]'
      }))
    });
  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    res.status(500).json({ 
      error: 'Test endpoint failed', 
      details: error.message 
    });
  }
});

// Database migration endpoint - Add additional_attendees column
app.post('/api/migrate/add-additional-attendees', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ error: 'Database not available' });
    }

    console.log('🔧 Running migration: Add additional_attendees column');
    
    // Add the column if it doesn't exist
    await pool.query(`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS additional_attendees TEXT DEFAULT '[]'
    `);
    
    // Update existing bookings to have empty array
    await pool.query(`
      UPDATE bookings 
      SET additional_attendees = '[]' 
      WHERE additional_attendees IS NULL
    `);
    
    console.log('✅ Migration completed: additional_attendees column added');
    res.json({ 
      success: true, 
      message: 'additional_attendees column added successfully' 
    });
  } catch (error) {
    console.error('❌ Migration failed:', error);
    res.status(500).json({ 
      error: 'Migration failed', 
      details: error.message 
    });
  }
});

// In-memory event storage (used when no database)
let inMemoryEvents = [
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
          totalTickets: 500,
          is_active: true
  },
  {
    id: 2,
    title: "VIP Exclusive Gala",
    date: "2024-12-31T20:00:00Z",
    location: "Grand Ballroom",
    price: 150.00,
    currency: "EUR",
    minAge: 21,
    dressCode: "Black Tie",
    description: "An exclusive New Year's Eve gala for VIP members only. Limited seats available.",
    additionalInfo: "Champagne reception and five-course dinner included.",
    availableTickets: 0,
    totalTickets: 50,
    is_active: true,
    status: 'sold-out'
  },
  {
    id: 3,
    title: "Tech Career Fair 2025",
    date: "2025-01-20T10:00:00Z",
    location: "Convention Center Hall A",
    price: 0,
    currency: "EUR",
    minAge: 18,
    dressCode: "Business Casual",
    description: "Meet top tech companies and explore career opportunities. This event has been cancelled due to unforeseen circumstances.",
    additionalInfo: "Refunds will be processed within 5-7 business days.",
    availableTickets: 200,
    totalTickets: 200,
    is_active: false,
    status: 'cancelled'
  },
  {
    id: 4,
    title: "Summer Beach Party 2024",
    date: "2024-08-15T16:00:00Z",
    location: "Sunset Beach",
    price: 15.00,
    currency: "EUR",
    minAge: 18,
    dressCode: "Beach Casual",
    description: "This event has already concluded. Thanks to everyone who attended!",
    additionalInfo: "Photos from the event are available on our social media.",
    availableTickets: 0,
    totalTickets: 300,
    is_active: false,
    status: 'completed-shown'
  }
];

// In-memory worker storage (used when no database)
let inMemoryWorkers = [];

// In-memory policy storage - REMOVED (using database-based policy system instead)
// The policyData object has been removed to prevent conflicts with the database-based system

// Middleware to verify admin token
function verifyAdminToken(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Middleware to verify worker token
function verifyWorkerToken(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    if (decoded.role !== 'worker' && decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Worker access required' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// API routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'production',
    database: process.env.DATABASE_URL ? 'connected' : 'mock'
  });
});

// GET /api/events - Get all active events
app.get('/api/events', async (req, res) => {
  try {
    if (pool) {
      // Use database - return all events, let frontend filter
      const result = await pool.query('SELECT * FROM events ORDER BY date ASC');
      console.log('🔍 GET /api/events - Returning events from database:', result.rows.length);
      result.rows.forEach(event => {
        console.log(`🔍 Event "${event.title}" - total_tickets: ${event.total_tickets}, available_tickets: ${event.available_tickets}`);
      });
      res.json(result.rows);
    } else {
      // Use in-memory storage - return all events, let frontend filter
      console.log('🔍 GET /api/events - Returning events from memory:', inMemoryEvents.length);
      res.json(inMemoryEvents);
    }
  } catch (error) {
    console.error('Error fetching events:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch events', details: error.message });
  }
});

// GET /api/events/:id - Get single event by ID
app.get('/api/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id; // Keep as string for UUID support
    
    if (pool) {
      // Use database - ID is a UUID string
      const result = await pool.query('SELECT * FROM events WHERE id = $1', [eventId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }
      res.json(result.rows[0]);
    } else {
      // Use in-memory storage - convert to int for legacy support
      const event = inMemoryEvents.find(e => e.id === parseInt(eventId));
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      res.json(event);
    }
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// POST /api/events - Create new event (admin only)
app.post('/api/events', verifyAdminToken, async (req, res) => {
  try {
    const { title, date, location, price, description, additionalInfo, totalTickets, minAge, dressCode, currency } = req.body;
    
    if (!title || !date || !location) {
      return res.status(400).json({ error: 'Title, date, and location are required' });
    }
    
    const newEvent = {
      id: Date.now(),
      title,
      date,
      location,
      price: parseFloat(price) || 0,
      currency: currency || 'EUR',
      minAge: minAge ? parseInt(minAge) : null,
      dressCode: dressCode || null,
      description: description || '',
      additionalInfo: additionalInfo || '',
      totalTickets: parseInt(totalTickets) || 100,
      availableTickets: parseInt(totalTickets) || 100,
      is_active: true
    };
    
    if (pool) {
      // Save to database
      const result = await pool.query(
        `INSERT INTO events (title, date, location, price, currency, min_age, dress_code, description, additional_info, total_tickets, available_tickets, is_active) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
        [newEvent.title, newEvent.date, newEvent.location, newEvent.price, newEvent.currency, newEvent.minAge, 
         newEvent.dressCode, newEvent.description, newEvent.additionalInfo, newEvent.totalTickets, newEvent.availableTickets, newEvent.is_active]
      );
      console.log(`✅ Event created in database: ${newEvent.title}`);
      res.json(result.rows[0]);
    } else {
      // Save to in-memory storage
      inMemoryEvents.push(newEvent);
      console.log(`✅ Event created in memory: ${newEvent.title} (Total events: ${inMemoryEvents.length})`);
      console.log(`📋 Full event object:`, JSON.stringify(newEvent, null, 2));
      res.json(newEvent);
    }
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// PUT /api/events/:id - Update event (admin only)
app.put('/api/events/:id', verifyAdminToken, async (req, res) => {
  try {
    console.log('🔍 PUT /api/events/:id - Starting event update...');
    const eventId = req.params.id; // Keep as string for UUID support
    const { title, date, location, price, description, additionalInfo, totalTickets, availableTickets, minAge, dressCode, currency, is_active, status, ticketsAvailableDate } = req.body;
    
    console.log('🔍 Event ID:', eventId);
    console.log('🔍 Request body:', req.body);
    
    // Ensure totalTickets is properly parsed as integer
    const parsedTotalTickets = totalTickets ? parseInt(totalTickets) : null;
    // Fix: available_tickets cannot be null due to database constraint
    const parsedAvailableTickets = availableTickets ? parseInt(availableTickets) : (parsedTotalTickets || 100);
    
    console.log('🔍 PUT /api/events/:id - Received data:', { eventId, minAge, dressCode, title, date, totalTickets });
    console.log('🔍 Date received:', date, 'Type:', typeof date);
    console.log('🔍 minAge received:', minAge, 'Type:', typeof minAge);
    console.log('🔍 dressCode received:', dressCode, 'Type:', typeof dressCode);
    console.log('🔍 totalTickets received:', totalTickets, 'Type:', typeof totalTickets);
    console.log('🔍 parsedTotalTickets:', parsedTotalTickets, 'Type:', typeof parsedTotalTickets);
    console.log('🔍 parsedAvailableTickets:', parsedAvailableTickets, 'Type:', typeof parsedAvailableTickets);
    
    if (pool) {
      // Update in database
      console.log('🔍 About to execute database update query...');
      console.log('🔍 Query parameters:', [title, date, location, price, currency, minAge, dressCode, description, additionalInfo, parsedTotalTickets, parsedAvailableTickets, is_active, status, ticketsAvailableDate, eventId]);
      
      try {
        const result = await pool.query(
          `UPDATE events SET title = $1, date = $2, location = $3, price = $4, currency = $5, min_age = $6, 
           dress_code = $7, description = $8, additional_info = $9, total_tickets = $10, available_tickets = $11, is_active = $12, 
           status = $13, tickets_available_date = $14
           WHERE id = $15 RETURNING *`,
          [title, date, location, price, currency, minAge, dressCode, description, additionalInfo, parsedTotalTickets, parsedAvailableTickets, is_active, status, ticketsAvailableDate, eventId]
        );
        
        console.log('🔍 Database query executed successfully');
        console.log('🔍 Result rows:', result.rows.length);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Event not found' });
        }
        
        console.log(`✅ Event updated in database: ${title}`);
        console.log('🔍 Updated event data:', result.rows[0]);
        console.log('🔍 Updated min_age:', result.rows[0].min_age);
        console.log('🔍 Updated dress_code:', result.rows[0].dress_code);
        console.log('🔍 Updated total_tickets:', result.rows[0].total_tickets);
        console.log('🔍 Updated available_tickets:', result.rows[0].available_tickets);
        res.json(result.rows[0]);
      } catch (dbError) {
        console.error('❌ Database query failed:', dbError);
        console.error('❌ Database error details:', {
          message: dbError.message,
          code: dbError.code,
          detail: dbError.detail,
          hint: dbError.hint
        });
        throw dbError;
      }
    } else {
      // Update in-memory storage
      const eventIndex = inMemoryEvents.findIndex(e => e.id == eventId);
      
      if (eventIndex === -1) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      inMemoryEvents[eventIndex] = {
        ...inMemoryEvents[eventIndex],
        title: title || inMemoryEvents[eventIndex].title,
        date: date || inMemoryEvents[eventIndex].date,
        location: location || inMemoryEvents[eventIndex].location,
        price: price !== undefined ? parseFloat(price) : inMemoryEvents[eventIndex].price,
        currency: currency || inMemoryEvents[eventIndex].currency,
        minAge: minAge !== undefined ? (minAge ? parseInt(minAge) : null) : inMemoryEvents[eventIndex].minAge,
        dressCode: dressCode !== undefined ? (dressCode || null) : inMemoryEvents[eventIndex].dressCode,
        description: description !== undefined ? description : inMemoryEvents[eventIndex].description,
        additionalInfo: additionalInfo !== undefined ? additionalInfo : inMemoryEvents[eventIndex].additionalInfo,
        totalTickets: totalTickets !== undefined ? parseInt(totalTickets) : inMemoryEvents[eventIndex].totalTickets,
        availableTickets: availableTickets !== undefined ? parseInt(availableTickets) : inMemoryEvents[eventIndex].availableTickets,
        is_active: is_active !== undefined ? is_active : inMemoryEvents[eventIndex].is_active
      };
      
      console.log(`✅ Event updated in memory: ${inMemoryEvents[eventIndex].title}`);
      res.json(inMemoryEvents[eventIndex]);
    }
  } catch (error) {
    console.error('❌ Error updating event:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    res.status(500).json({ 
      error: 'Failed to update event', 
      details: error.message,
      code: error.code 
    });
  }
});

// DELETE /api/events/:id - Delete event (admin only)
app.delete('/api/events/:id', verifyAdminToken, async (req, res) => {
  try {
    const eventId = req.params.id; // Keep as string for UUID support
    
    if (pool) {
      // Delete from database
      const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING *', [eventId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      console.log(`✅ Event deleted from database: ${result.rows[0].title}`);
      res.json({ success: true, message: 'Event deleted successfully' });
    } else {
      // Delete from in-memory storage
      const eventIndex = inMemoryEvents.findIndex(e => e.id == eventId);
      
      if (eventIndex === -1) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      const deletedEvent = inMemoryEvents.splice(eventIndex, 1)[0];
      console.log(`✅ Event deleted from memory: ${deletedEvent.title} (Remaining events: ${inMemoryEvents.length})`);
      res.json({ success: true, message: 'Event deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

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

// GET /api/policy - Get policy content (public)
app.get('/api/policy', async (req, res) => {
  try {
    if (pool) {
      // First, let's check if the settings table exists and has data
      const tableCheck = await pool.query(`
        SELECT COUNT(*) as count FROM settings WHERE key LIKE 'policy_%'
      `);
      console.log('🔍 Database check - Policy records count:', tableCheck.rows[0].count);
      
      const result = await pool.query(`
        SELECT key, value FROM settings 
        WHERE key LIKE 'policy_%' 
        ORDER BY key
      `);
      
      console.log('🔍 Policy query result:', result.rows);
      
      const policy = {
        terms_of_service: '',
        privacy_policy: '',
        event_guidelines: '',
        ticket_policy: '',
        refund_policy: '',
        code_of_conduct: ''
      };
      
      result.rows.forEach(row => {
        const policyKey = row.key.replace('policy_', '');
        policy[policyKey] = row.value || '';
        console.log(`🔍 Policy field: ${row.key} -> ${policyKey} = ${row.value}`);
      });
      
      console.log('🔍 Final policy object:', policy);
      res.json(policy);
    } else {
      // Fallback policy
      res.json({
        terms_of_service: 'Default terms of service content...',
        privacy_policy: 'Default privacy policy content...',
        event_guidelines: 'Default event guidelines content...',
        ticket_policy: 'Default ticket policy content...',
        refund_policy: 'Default refund policy content...',
        code_of_conduct: 'Default code of conduct content...'
      });
    }
  } catch (error) {
    console.error('Error fetching policy:', error);
    res.status(500).json({ error: 'Failed to fetch policy' });
  }
});

// PUT /api/admin/policy - Update policy content (admin only)
app.put('/api/admin/policy', verifyAdminToken, async (req, res) => {
  try {
    const { 
      terms_of_service, 
      privacy_policy, 
      event_guidelines, 
      ticket_policy, 
      refund_policy, 
      code_of_conduct 
    } = req.body;

    console.log('🔍 Policy update request:', req.body);

    if (!pool) {
      return res.status(503).json({ error: 'Database not available' });
    }

    // Update each policy field
    const updates = [
      { key: 'policy_terms_of_service', value: terms_of_service },
      { key: 'policy_privacy_policy', value: privacy_policy },
      { key: 'policy_event_guidelines', value: event_guidelines },
      { key: 'policy_ticket_policy', value: ticket_policy },
      { key: 'policy_refund_policy', value: refund_policy },
      { key: 'policy_code_of_conduct', value: code_of_conduct }
    ];

    for (const update of updates) {
      if (update.value !== undefined) {
        console.log(`🔍 Updating policy field: ${update.key} = ${update.value}`);
        await pool.query(`
          INSERT INTO settings (key, value, category, label)
          VALUES ($1, $2, 'policy', $1)
          ON CONFLICT (key) 
          DO UPDATE SET value = $2, updated_at = NOW()
        `, [update.key, update.value]);
      }
    }

    console.log('✅ Policy content updated');
    res.json({ message: 'Policy updated successfully' });
  } catch (error) {
    console.error('Error updating policy:', error);
    res.status(500).json({ error: 'Failed to update policy' });
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
      quantity,
      additionalAttendees
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
    const discount = 0; // No discount - ISM status tracked for record keeping only
    const unitPrice = basePrice;
    const totalAmount = basePrice * quantity;

    // Generate unique payment reference
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    const paymentReference = `TICKET-${timestamp}-${random}`;

    // Calculate payment deadline
    const deadlineHours = parseInt(settings.payment_deadline_hours || '24');
    const paymentDeadline = new Date(Date.now() + deadlineHours * 60 * 60 * 1000);

    // Create booking
    console.log('🔍 Creating booking with data:', {
      eventId, firstName, lastName, email, phone, isISMStudent, quantity,
      additionalAttendees: additionalAttendees || []
    });
    
    const bookingResult = await pool.query(`
      INSERT INTO bookings (
        event_id, first_name, last_name, email, phone,
        is_ism_student, quantity, unit_price, discount,
        total_amount, payment_reference, payment_deadline, additional_attendees
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      eventId, firstName, lastName, email, phone,
      isISMStudent, quantity, unitPrice, discount,
      totalAmount, paymentReference, paymentDeadline, JSON.stringify(additionalAttendees || [])
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
    console.error('❌ Error creating booking:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
    res.status(500).json({ 
      error: 'Failed to create booking',
      details: error.message 
    });
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
        e.date as event_date,
        e.time as event_time,
        e.location as event_location
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

// DELETE /api/admin/bookings/:id - Delete booking permanently (admin only)
app.delete('/api/admin/bookings/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!pool) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const result = await pool.query('DELETE FROM bookings WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ message: 'Booking deleted successfully', booking: result.rows[0] });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

// POST /api/admin/bookings/:id/cancel - Cancel booking (admin only)
app.post('/api/admin/bookings/:id/cancel', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!pool) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const result = await pool.query(`
      UPDATE bookings 
      SET payment_status = 'cancelled', updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// POST /api/admin/bookings/:id/confirm - Confirm booking and send tickets (admin only)
app.post('/api/admin/bookings/:id/confirm', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!pool) {
      return res.status(503).json({ error: 'Database not available' });
    }

    // Get booking with event details
    const bookingResult = await pool.query(`
      SELECT 
        b.*,
        e.title as event_title,
        e.date as event_date,
        e.time as event_time,
        e.location as event_location,
        e.description as event_description,
        e.min_age as event_min_age,
        e.dress_code as event_dress_code
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      WHERE b.id = $1
    `, [id]);

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    // Update booking status to paid
    await pool.query(`
      UPDATE bookings 
      SET payment_status = 'paid', updated_at = NOW()
      WHERE id = $1
    `, [id]);

    // Generate tickets for each attendee
    const tickets = [];
    const additionalAttendees = JSON.parse(booking.additional_attendees || '[]');
    const totalAttendees = 1 + additionalAttendees.length; // Primary + additional

    // Primary attendee ticket
    const primaryTicketNumber = `TICKET-${booking.event_id.substring(0, 8)}-${booking.id.substring(0, 8)}-001`;
    tickets.push({
      ticketNumber: primaryTicketNumber,
      firstName: booking.first_name,
      lastName: booking.last_name,
      email: booking.email
    });

    // Additional attendees tickets
    additionalAttendees.forEach((attendee, index) => {
      const ticketNumber = `TICKET-${booking.event_id.substring(0, 8)}-${booking.id.substring(0, 8)}-${String(index + 2).padStart(3, '0')}`;
      tickets.push({
        ticketNumber,
        firstName: attendee.firstName,
        lastName: attendee.lastName,
        email: attendee.email || booking.email // Fallback to primary email
      });
    });

    // Generate QR codes for each ticket - matches frontend format with personalized data
    const ticketsWithQR = [];
    for (const ticket of tickets) {
      // Create personalized QR data with ticket number, first name, last name
      const qrData = JSON.stringify({
        ticketNumber: ticket.ticketNumber,
        firstName: ticket.firstName,
        lastName: ticket.lastName
      });
      
      // Generate QR code with personalized data
      const qrDataUrl = await QRCode.toDataURL(qrData, {
        width: 128,
        height: 128,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      ticketsWithQR.push({ 
        ...ticket, 
        qrCode: qrDataUrl,
        qrCodeUrl: qrDataUrl // For compatibility
      });
    }

    // Send email with tickets (if SendGrid is configured)
    let emailSent = false;
    let emailError = null;
    
    if (!sgMail || !process.env.SENDGRID_API_KEY) {
      console.warn('⚠️ SendGrid not configured - Email will NOT be sent');
      console.warn('   Set SENDGRID_API_KEY and SENDGRID_FROM_EMAIL environment variables');
      emailError = 'SendGrid not configured';
    } else {
      // Generate PDF tickets for each attendee
      const pdfAttachments = [];
      
      for (let i = 0; i < ticketsWithQR.length; i++) {
        const ticket = ticketsWithQR[i];
        const attendeeNumber = i + 1;
        
        // Generate PDF content for this ticket - matches frontend format exactly
        const pdfContent = await generateTicketPDF({
          eventTitle: booking.event_title,
          eventDate: booking.event_date,
          eventTime: booking.event_time || 'TBD',
          eventLocation: booking.event_location || 'TBD',
          eventMinAge: booking.event_min_age,
          eventDressCode: booking.event_dress_code,
          attendeeName: `${ticket.firstName} ${ticket.lastName}`,
          attendeeEmail: ticket.email,
          attendeePhone: booking.phone,
          ticketNumber: ticket.ticketNumber,
          qrCode: ticket.qrCode,
          quantity: booking.quantity,
          totalAmount: booking.total_amount,
          attendeeNumber: attendeeNumber,
          totalAttendees: ticketsWithQR.length
        });
        
        pdfAttachments.push({
          content: pdfContent,
          filename: `ticket-${ticket.ticketNumber}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        });
      }

      // Generate participants list
      let participantsList = '';
      tickets.forEach((ticket, index) => {
        participantsList += `${index + 1}. ${ticket.firstName} ${ticket.lastName} – General Admission\n`;
      });

      const emailBody = `Hello ${booking.first_name},

Your payment has been successfully approved!

Here are your ticket details:

Event: ${booking.event_title}
Date: ${new Date(booking.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Location: ${booking.event_location || 'TBD'}

Participants:
${participantsList}

Important:
Until 23:00 there will be a ticket check-up. After that, entrance will not be possible without the bracelet, which will be given between 21:00–23:00.

See you at the event!
StudentEvents Team`;

      const msg = {
        to: booking.email,
        from: process.env.SENDGRID_FROM_EMAIL || 'afterstate.events@gmail.com',
        subject: `Your Tickets Are Approved – ${booking.event_title}`,
        text: emailBody,
        attachments: pdfAttachments
      };

      try {
        console.log(`📧 Attempting to send ticket email to ${booking.email}...`);
        await sgMail.send(msg);
        console.log(`✅ ✉️ Ticket email sent successfully to ${booking.email}`);
        emailSent = true;
      } catch (error) {
        console.error('❌ Error sending ticket email:', error.message);
        if (error.response) {
          console.error('   SendGrid Response:', error.response.body);
        }
        emailError = error.message;
      }
    }

    res.json({ 
      message: 'Booking confirmed' + (emailSent ? ' and tickets sent' : ' (email failed)'),
      tickets: ticketsWithQR,
      emailSent,
      emailError
    });

  } catch (error) {
    console.error('Error confirming booking:', error);
    res.status(500).json({ error: 'Failed to confirm booking' });
  }
});

// Admin login endpoint
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Check credentials
    if (email === 'admin@studentevents.com' && password === 'admin123') {
      const token = jwt.sign(
        { 
          id: 'admin-1', 
          email: 'admin@studentevents.com', 
          role: 'admin' 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      
      res.json({
        success: true,
        token,
        user: {
          id: 'admin-1',
          email: 'admin@studentevents.com',
          role: 'admin'
        }
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Worker login endpoint
app.post('/api/worker/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find worker by email in in-memory storage
    const worker = inMemoryWorkers.find(w => w.email === email && w.status === 'active');
    
    if (!worker || worker.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Update last active
    worker.lastActive = new Date().toISOString();
    
      const token = jwt.sign(
        { 
        id: worker.id, 
        email: worker.email, 
        role: worker.role 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
    
    console.log(`✅ Worker logged in: ${worker.email}`);
      
      res.json({
        success: true,
        token,
        user: {
        id: worker.id,
        email: worker.email,
        role: worker.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/workers - List workers (admin only)
app.get('/api/workers', verifyAdminToken, async (req, res) => {
  try {
    // Return workers without passwords
    const workers = inMemoryWorkers.map(({ password, ...worker }) => worker);
    res.json(workers);
  } catch (error) {
    console.error('Workers API error:', error);
    res.status(500).json({ error: 'Failed to fetch workers' });
  }
});

// POST /api/workers - Create worker (admin only)
app.post('/api/workers', verifyAdminToken, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Check if email already exists
    const existing = inMemoryWorkers.find(w => w.email === email);
    if (existing) {
      return res.status(400).json({ error: 'Worker with this email already exists' });
    }
    
    const newWorker = {
      id: `worker-${Date.now()}`,
      name: name || 'Unknown',
      email,
      password, // In production, hash this!
      role: role || 'worker',
      status: 'active',
      createdAt: new Date().toISOString(),
      lastActive: null
    };
    
    inMemoryWorkers.push(newWorker);
    console.log(`✅ Worker created: ${newWorker.name} (${newWorker.email}) - Total workers: ${inMemoryWorkers.length}`);
    
    // Return without password
    const { password: _, ...workerResponse } = newWorker;
    res.json(workerResponse);
  } catch (error) {
    console.error('Error creating worker:', error);
    res.status(500).json({ error: 'Failed to create worker' });
  }
});

// PUT /api/workers/:id - Update worker (admin only)
app.put('/api/workers/:id', verifyAdminToken, async (req, res) => {
  try {
    const workerId = req.params.id;
    const { name, email, password, role, status } = req.body;
    
    const workerIndex = inMemoryWorkers.findIndex(w => w.id === workerId);
    if (workerIndex === -1) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    
    // Update worker
    if (name) inMemoryWorkers[workerIndex].name = name;
    if (email) inMemoryWorkers[workerIndex].email = email;
    if (password) inMemoryWorkers[workerIndex].password = password;
    if (role) inMemoryWorkers[workerIndex].role = role;
    if (status !== undefined) inMemoryWorkers[workerIndex].status = status;
    
    console.log(`✅ Worker updated: ${inMemoryWorkers[workerIndex].name} (${inMemoryWorkers[workerIndex].email})`);
    
    const { password: _, ...workerResponse } = inMemoryWorkers[workerIndex];
    res.json(workerResponse);
  } catch (error) {
    console.error('Error updating worker:', error);
    res.status(500).json({ error: 'Failed to update worker' });
  }
});

// DELETE /api/workers/:id - Delete worker (admin only)
app.delete('/api/workers/:id', verifyAdminToken, async (req, res) => {
  try {
    const workerId = req.params.id;
    const workerIndex = inMemoryWorkers.findIndex(w => w.id === workerId);
    
    if (workerIndex === -1) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    
    const deletedWorker = inMemoryWorkers.splice(workerIndex, 1)[0];
    console.log(`✅ Worker deleted: ${deletedWorker.email} (Remaining: ${inMemoryWorkers.length})`);
    
    res.json({ success: true, message: 'Worker deleted successfully' });
  } catch (error) {
    console.error('Error deleting worker:', error);
    res.status(500).json({ error: 'Failed to delete worker' });
  }
});

// ===== POLICY & RULES ENDPOINTS =====

// POST /api/admin/policy/clear - Clear all policy data (admin only)
app.post('/api/admin/policy/clear', verifyAdminToken, async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    // Delete all existing policy settings
    const result = await pool.query(`
      DELETE FROM settings WHERE key LIKE 'policy_%'
    `);
    
    console.log(`🧹 Cleared ${result.rowCount} policy settings`);
    
    res.json({ 
      success: true, 
      message: 'Policy data cleared successfully',
      clearedCount: result.rowCount 
    });
  } catch (error) {
    console.error('Error clearing policy data:', error);
    res.status(500).json({ error: 'Failed to clear policy data' });
  }
});

// GET /api/debug/database - Debug database connection and settings
app.get('/api/debug/database', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    // Check if settings table exists
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'settings'
      );
    `);
    
    // Count total settings
    const totalSettings = await pool.query('SELECT COUNT(*) as count FROM settings');
    
    // Count policy settings
    const policySettings = await pool.query(`
      SELECT COUNT(*) as count FROM settings WHERE key LIKE 'policy_%'
    `);
    
    // Get all policy settings
    const allPolicySettings = await pool.query(`
      SELECT key, value, updated_at FROM settings WHERE key LIKE 'policy_%' ORDER BY key
    `);
    
    res.json({
      databaseConnected: true,
      settingsTableExists: tableExists.rows[0].exists,
      totalSettings: totalSettings.rows[0].count,
      policySettingsCount: policySettings.rows[0].count,
      policySettings: allPolicySettings.rows
    });
  } catch (error) {
    console.error('Database debug error:', error);
    res.status(500).json({ error: 'Database debug failed', details: error.message });
  }
});

// GET /api/policy - Get policy data (public) - REMOVED DUPLICATE
// This endpoint was removed because it conflicts with the database-based policy system above

// PUT /api/policy - Update policy (admin only) - REMOVED DUPLICATE
// app.put('/api/policy', verifyAdminToken, async (req, res) => {
// This entire endpoint was removed because it conflicts with the database-based policy system above
// The database-based system uses PUT /api/admin/policy instead
// });

// POST /api/policy/sections - REMOVED (in-memory system)
// DELETE /api/policy/sections/:id - REMOVED (in-memory system)
// These endpoints were removed because they use the in-memory policyData system
// The database-based policy system above handles all policy operations

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
// ===== PAYMENT & TICKETING ENDPOINTS =====

// POST /api/create-payment-intent - Create Stripe payment intent
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    const { eventId, quantity, attendeeInfo } = req.body;
    
    // Get event details
    let event;
    if (pool) {
      const result = await pool.query('SELECT * FROM events WHERE id = $1', [eventId]);
      event = result.rows[0];
    } else {
      event = inMemoryEvents.find(e => e.id == eventId);
    }
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const amount = Math.round(event.price * quantity * 100); // Convert to cents
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: (event.currency || 'EUR').toLowerCase(),
      metadata: { 
        eventId: eventId.toString(), 
        quantity: quantity.toString(),
        attendeeEmail: attendeeInfo.email 
      }
    });
    
    console.log(`💳 Payment intent created: ${paymentIntent.id} for ${amount/100} ${event.currency}`);
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Helper function to generate QR code ticket
async function generateTicket(eventId, attendeeInfo, paymentIntentId, pricePaid) {
  const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  
  // Generate QR code data
  const qrData = JSON.stringify({
    ticketNumber,
    eventId,
    attendee: attendeeInfo.email,
    issuedAt: new Date().toISOString()
  });
  
  const qrCodeUrl = await QRCode.toDataURL(qrData);
  
  // Save ticket to database or memory
  const ticketData = {
    eventId,
    attendeeName: `${attendeeInfo.firstName} ${attendeeInfo.lastName}`,
    attendeeEmail: attendeeInfo.email,
    attendeePhone: attendeeInfo.phone || '',
    ticketNumber,
    qrCode: qrCodeUrl,
    pricePaid,
    stripePaymentIntentId: paymentIntentId,
    status: 'valid'
  };
  
  if (process.env.DATABASE_URL) {
    await pool.query(
      `INSERT INTO tickets (event_id, attendee_name, attendee_email, attendee_phone, 
       ticket_number, qr_code, price_paid, stripe_payment_intent_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [ticketData.eventId, ticketData.attendeeName, ticketData.attendeeEmail, 
       ticketData.attendeePhone, ticketData.ticketNumber, ticketData.qrCode, 
       ticketData.pricePaid, ticketData.stripePaymentIntentId, ticketData.status]
    );
  }
  
  return { ticketNumber, qrCodeUrl };
}

// Helper function to send ticket email
async function sendTicketEmail(attendeeEmail, eventDetails, tickets) {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('⚠️ SendGrid not configured, skipping email');
    return;
  }
  
  const msg = {
    to: attendeeEmail,
    from: { 
      email: process.env.FROM_EMAIL || 'afterstate.events@gmail.com', 
      name: process.env.FROM_NAME || 'StudentEvents' 
    },
    subject: `Your Ticket for ${eventDetails.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; }
          .ticket { background: white; padding: 20px; margin: 20px 0; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .qr-code { text-align: center; margin: 20px 0; }
          .qr-code img { max-width: 200px; }
          .details { margin: 15px 0; }
          .details strong { color: #667eea; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎫 Your Ticket is Ready!</h1>
          </div>
          <div class="content">
            <p>Hi there!</p>
            <p>Thank you for your purchase. Your ticket for <strong>${eventDetails.title}</strong> is confirmed!</p>
            
            <div class="ticket">
              <div class="details">
                <p><strong>📅 Date:</strong> ${new Date(eventDetails.date).toLocaleString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
                <p><strong>📍 Location:</strong> ${eventDetails.location}</p>
                <p><strong>🎟️ Ticket Number:</strong> ${tickets[0].ticketNumber}</p>
              </div>
              
              <div class="qr-code">
                <h3>Your QR Code Ticket</h3>
                <img src="${tickets[0].qrCodeUrl}" alt="QR Code">
                <p><small>Show this QR code at the entrance</small></p>
              </div>
            </div>
            
            <p><strong>Important:</strong> Please save this email or take a screenshot of the QR code. You'll need to present it at the event entrance.</p>
          </div>
          <div class="footer">
            <p>StudentEvents - Your ticket to amazing experiences</p>
            <p>Questions? Contact us at afterstate.events@gmail.com or +37063849474</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  
  await sgMail.send(msg);
  console.log(`📧 Ticket email sent to ${attendeeEmail}`);
}

// POST /api/tickets/purchase - Complete ticket purchase after payment
app.post('/api/tickets/purchase', async (req, res) => {
  try {
    const { eventId, quantity, attendeeInfo, paymentIntentId } = req.body;
    
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }
    
    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not completed' });
    }
    
    // Get event details
    let event;
    if (pool) {
      const result = await pool.query('SELECT * FROM events WHERE id = $1', [eventId]);
      event = result.rows[0];
    } else {
      event = inMemoryEvents.find(e => e.id == eventId);
    }
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check ticket availability
    if (event.available_tickets < quantity) {
      return res.status(400).json({ error: 'Not enough tickets available' });
    }
    
    // Generate tickets
    const tickets = [];
    const pricePaid = event.price;
    
    for (let i = 0; i < quantity; i++) {
      const ticket = await generateTicket(eventId, attendeeInfo, paymentIntentId, pricePaid);
      tickets.push(ticket);
    }
    
    // Update available tickets
    if (pool) {
      await pool.query(
        'UPDATE events SET available_tickets = available_tickets - $1 WHERE id = $2',
        [quantity, eventId]
      );
    } else {
      const eventIndex = inMemoryEvents.findIndex(e => e.id == eventId);
      if (eventIndex !== -1) {
        inMemoryEvents[eventIndex].availableTickets -= quantity;
      }
    }
    
    // Send confirmation email
    try {
      await sendTicketEmail(attendeeInfo.email, event, tickets);
    } catch (emailError) {
      console.error('Email send failed:', emailError);
      // Continue even if email fails
    }
    
    const orderNumber = `ORD-${Date.now()}`;
    console.log(`✅ Tickets purchased: ${orderNumber} - ${quantity} ticket(s) for ${event.title}`);
    
    res.json({ 
      success: true, 
      tickets,
      orderNumber,
      event: {
        title: event.title,
        date: event.date,
        location: event.location
      }
    });
  } catch (error) {
    console.error('Error processing ticket purchase:', error);
    res.status(500).json({ error: 'Failed to process purchase' });
  }
});

// GET /api/tickets/validate/:ticketNumber - Validate a ticket (for workers)
app.get('/api/tickets/validate/:ticketNumber', verifyWorkerToken, async (req, res) => {
  try {
    const { ticketNumber } = req.params;
    
    let ticket;
    if (pool) {
      const result = await pool.query(
        'SELECT t.*, e.title as event_title FROM tickets t JOIN events e ON t.event_id = e.id WHERE t.ticket_number = $1',
        [ticketNumber]
      );
      ticket = result.rows[0];
    }
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json({
      valid: ticket.status === 'valid',
      ticket: {
        number: ticket.ticket_number,
        attendee: ticket.attendee_name,
        email: ticket.attendee_email,
        event: ticket.event_title,
        status: ticket.status
      }
    });
  } catch (error) {
    console.error('Error validating ticket:', error);
    res.status(500).json({ error: 'Failed to validate ticket' });
  }
});

// POST /api/tickets/mark-used/:ticketNumber - Mark ticket as used (for workers)
app.post('/api/tickets/mark-used/:ticketNumber', verifyWorkerToken, async (req, res) => {
  try {
    const { ticketNumber } = req.params;
    
    if (pool) {
      const result = await pool.query(
        'UPDATE tickets SET status = $1 WHERE ticket_number = $2 RETURNING *',
        ['used', ticketNumber]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Ticket not found' });
      }
      
      console.log(`✅ Ticket marked as used: ${ticketNumber}`);
      res.json({ success: true, ticket: result.rows[0] });
    } else {
      res.status(501).json({ error: 'Database required for ticket validation' });
    }
  } catch (error) {
    console.error('Error marking ticket as used:', error);
    res.status(500).json({ error: 'Failed to mark ticket as used' });
  }
});

// ===== WORKER MANAGEMENT ENDPOINTS =====

// POST /api/admin/workers - Create worker (admin only)
app.post('/api/admin/workers', verifyAdminToken, async (req, res) => {
  try {
    const { fullName, full_name, name, email, password, role, eventId, event_id } = req.body;

    // Support multiple naming conventions
    const workerName = fullName || full_name || name;
    const workerEventId = eventId || event_id || null; // Allow null for no event assignment

    if (!workerName || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields (name, email, password, role)' });
    }

    if (!['worker', 'supervisor', 'manager'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be worker, supervisor, or manager' });
    }

    if (!pool) {
      return res.status(503).json({ error: 'Database not available' });
    }

    // Check if email already exists
    const existingWorker = await pool.query('SELECT id FROM workers WHERE email = $1', [email]);
    if (existingWorker.rows.length > 0) {
      return res.status(409).json({ error: 'Worker with this email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create worker
    const result = await pool.query(
      `INSERT INTO workers (full_name, email, password_hash, role, event_id) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, email, role, event_id, created_at`,
      [workerName, email, passwordHash, role, workerEventId]
    );

    console.log(`✅ Worker created: ${email} (${role}) - Event: ${workerEventId || 'none'}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating worker:', error);
    res.status(500).json({ error: 'Failed to create worker' });
  }
});

// GET /api/admin/workers - List all workers (admin only)
app.get('/api/admin/workers', verifyAdminToken, async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ error: 'Database not available' });
    }

    console.log('🔍 GET /api/admin/workers - Fetching workers from database...');
    const result = await pool.query(`
      SELECT 
        w.id, w.full_name, w.email, w.role, w.event_id, w.created_at,
        e.title as event_title
      FROM workers w
      LEFT JOIN events e ON w.event_id = e.id
      ORDER BY w.created_at DESC
    `);

    console.log(`🔍 Found ${result.rows.length} workers in database`);
    result.rows.forEach(worker => {
      console.log(`🔍 Worker: ${worker.full_name} - Event: ${worker.event_title || 'No event'} (ID: ${worker.event_id})`);
    });

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching workers:', error);
    res.status(500).json({ error: 'Failed to fetch workers' });
  }
});

// PUT /api/admin/workers/:id - Update worker (admin only)
app.put('/api/admin/workers/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, full_name, name, email, password, role, eventId, event_id, status } = req.body;

    // Support multiple naming conventions
    const workerName = fullName || full_name || name;
    const workerEventId = eventId || event_id;

    console.log('🔍 PUT /api/admin/workers - Update request:', { id, workerName, email, role, eventId, event_id, workerEventId });

    if (!pool) {
      return res.status(503).json({ error: 'Database not available' });
    }

    // Check if worker exists
    const existingWorker = await pool.query('SELECT id FROM workers WHERE id = $1', [id]);
    if (existingWorker.rows.length === 0) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    // Check if email is taken by another worker
    if (email) {
      const emailCheck = await pool.query('SELECT id FROM workers WHERE email = $1 AND id != $2', [email, id]);
      if (emailCheck.rows.length > 0) {
        return res.status(409).json({ error: 'Email already in use by another worker' });
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (workerName) {
      updates.push(`full_name = $${paramCount++}`);
      values.push(workerName);
    }
    if (email) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }
    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      updates.push(`password_hash = $${paramCount++}`);
      values.push(passwordHash);
    }
    if (role) {
      if (!['worker', 'supervisor', 'manager'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }
      updates.push(`role = $${paramCount++}`);
      values.push(role);
    }
    // Handle event assignment - always update event_id
    if (workerEventId !== undefined) {
      updates.push(`event_id = $${paramCount++}`);
      // Convert empty string to null, keep null as null, keep valid IDs as is
      const eventIdValue = (workerEventId === '' || workerEventId === null) ? null : workerEventId;
      values.push(eventIdValue);
      console.log(`🔍 Setting event_id to: ${eventIdValue} (original: ${workerEventId})`);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const query = `
      UPDATE workers 
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING id, full_name, email, role, event_id, updated_at
    `;

    const result = await pool.query(query, values);
    console.log(`✅ Worker updated: ${id}`);
    console.log(`🔍 Updated worker data:`, result.rows[0]);
    
    // Fetch the updated worker with event details
    const updatedWorker = await pool.query(`
      SELECT 
        w.id, w.full_name, w.email, w.role, w.event_id, w.created_at,
        e.title as event_title
      FROM workers w
      LEFT JOIN events e ON w.event_id = e.id
      WHERE w.id = $1
    `, [id]);
    
    console.log(`🔍 Worker after update: ${updatedWorker.rows[0]?.full_name} - Event: ${updatedWorker.rows[0]?.event_title || 'No event'} (ID: ${updatedWorker.rows[0]?.event_id})`);
    
    res.json(updatedWorker.rows[0]);
  } catch (error) {
    console.error('Error updating worker:', error);
    res.status(500).json({ error: 'Failed to update worker' });
  }
});

// DELETE /api/admin/workers/:id - Delete worker (admin only)
app.delete('/api/admin/workers/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!pool) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const result = await pool.query('DELETE FROM workers WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    console.log(`✅ Worker deleted: ${result.rows[0].email}`);
    res.json({ success: true, message: 'Worker deleted successfully' });
  } catch (error) {
    console.error('Error deleting worker:', error);
    res.status(500).json({ error: 'Failed to delete worker' });
  }
});

// POST /api/workers/login - Worker authentication
app.post('/api/workers/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    if (!pool) {
      return res.status(503).json({ error: 'Database not available' });
    }

    // Get worker with event details
    const result = await pool.query(`
      SELECT w.*, e.title as event_title, e.date as event_date
      FROM workers w
      LEFT JOIN events e ON w.event_id = e.id
      WHERE w.email = $1
    `, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const worker = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, worker.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        workerId: worker.id, 
        email: worker.email, 
        role: worker.role,
        eventId: worker.event_id
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '8h' }
    );

    console.log(`✅ Worker logged in: ${email} (${worker.role})`);
    res.json({
      token,
      worker: {
        id: worker.id,
        fullName: worker.full_name,
        email: worker.email,
        role: worker.role,
        eventId: worker.event_id,
        eventTitle: worker.event_title,
        eventDate: worker.event_date
      }
    });
  } catch (error) {
    console.error('Error during worker login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/workers/validate-ticket - Validate ticket (worker/supervisor only)
app.post('/api/workers/validate-ticket', verifyWorkerToken, async (req, res) => {
  try {
    const { ticketNumber } = req.body;
    const workerId = req.worker.workerId;
    const workerEventId = req.worker.eventId;

    if (!ticketNumber) {
      return res.status(400).json({ error: 'Ticket number required' });
    }

    if (!pool) {
      return res.status(503).json({ error: 'Database not available' });
    }

    // Find booking by payment reference (ticket number)
    const bookingResult = await pool.query(`
      SELECT 
        b.*,
        e.title as event_title,
        e.id as event_id
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      WHERE b.payment_reference = $1
    `, [ticketNumber]);

    if (bookingResult.rows.length === 0) {
      return res.json({
        valid: false,
        status: 'invalid',
        message: 'Ticket not found',
        ticketNumber
      });
    }

    const booking = bookingResult.rows[0];

    // Check if ticket is for worker's assigned event
    if (booking.event_id !== workerEventId) {
      return res.json({
        valid: false,
        status: 'wrong_event',
        message: 'Ticket is for a different event',
        ticketNumber,
        attendeeName: `${booking.first_name} ${booking.last_name}`
      });
    }

    // Check if payment is confirmed
    if (booking.payment_status !== 'paid') {
      return res.json({
        valid: false,
        status: 'not_paid',
        message: 'Payment not confirmed',
        ticketNumber,
        attendeeName: `${booking.first_name} ${booking.last_name}`,
        paymentStatus: booking.payment_status
      });
    }

    // Check if already validated
    const validatedTickets = booking.tickets_validated || [];
    const alreadyValidated = validatedTickets.find(t => t.ticket_number === ticketNumber);
    
    if (alreadyValidated) {
      return res.json({
        valid: false,
        status: 'already_used',
        message: 'Ticket already validated',
        ticketNumber,
        attendeeName: `${booking.first_name} ${booking.last_name}`,
        validatedAt: alreadyValidated.validated_at,
        validatedBy: alreadyValidated.validated_by_worker_id
      });
    }

    // Mark ticket as validated
    validatedTickets.push({
      ticket_number: ticketNumber,
      validated_at: new Date().toISOString(),
      validated_by_worker_id: workerId
    });

    await pool.query(
      'UPDATE bookings SET tickets_validated = $1 WHERE id = $2',
      [JSON.stringify(validatedTickets), booking.id]
    );

    console.log(`✅ Ticket validated: ${ticketNumber} by worker ${workerId}`);
    res.json({
      valid: true,
      status: 'valid',
      message: 'Ticket is valid',
      ticketNumber,
      attendeeName: `${booking.first_name} ${booking.last_name}`,
      eventTitle: booking.event_title,
      quantity: booking.quantity,
      validatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error validating ticket:', error);
    res.status(500).json({ error: 'Failed to validate ticket' });
  }
});

// GET /api/workers/participants/:eventId - Get participants list (supervisor only)
app.get('/api/workers/participants/:eventId', verifyWorkerToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const workerRole = req.worker.role;
    const workerEventId = req.worker.eventId;

    // Only supervisors can view participant lists
    if (workerRole !== 'supervisor') {
      return res.status(403).json({ error: 'Only supervisors can view participant lists' });
    }

    // Verify supervisor is assigned to this event
    if (eventId !== workerEventId) {
      return res.status(403).json({ error: 'You can only view participants for your assigned event' });
    }

    if (!pool) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const result = await pool.query(`
      SELECT 
        b.id,
        b.first_name,
        b.last_name,
        b.email,
        b.phone,
        b.is_ism_student,
        b.quantity,
        b.total_amount,
        b.payment_status,
        b.payment_reference,
        b.tickets_validated,
        b.created_at,
        b.additional_attendees
      FROM bookings b
      WHERE b.event_id = $1
      ORDER BY b.created_at DESC
    `, [eventId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
});

app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔗 Frontend URL: ${FRONTEND_URL}`);
  console.log(`🗄️ Database: ${process.env.DATABASE_URL ? 'PostgreSQL via Supabase' : 'In-memory mock storage'}`);
  console.log(`📧 SendGrid Email: ${process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL ? '✅ Configured' : '⚠️ NOT CONFIGURED - Emails will not be sent'}`);
  if (process.env.SENDGRID_FROM_EMAIL) {
    console.log(`   From: ${process.env.SENDGRID_FROM_EMAIL}`);
  }
  console.log(`✅ Admin credentials: admin@studentevents.com / admin123`);
  console.log(`✅ Worker credentials: john.worker@studentevents.com / worker123`);
});

// Test email endpoint for debugging
app.post('/api/test-email', async (req, res) => {
  try {
    const { to, subject = 'Test Email from StudentEvents' } = req.body;
    
    if (!to) {
      return res.status(400).json({ error: 'Email address required' });
    }
    
    if (!process.env.SENDGRID_API_KEY) {
      return res.status(500).json({ 
        error: 'SendGrid not configured',
        message: 'SENDGRID_API_KEY environment variable is missing'
      });
    }
    
    const msg = {
      to: to,
      from: process.env.SENDGRID_FROM_EMAIL || 'afterstate.events@gmail.com',
      subject: subject,
      html: `
        <h1>🧪 Test Email from StudentEvents</h1>
        <p>This is a test email to verify the email system is working.</p>
        <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
        <p><strong>From:</strong> ${process.env.SENDGRID_FROM_EMAIL || 'afterstate.events@gmail.com'}</p>
        <p>If you receive this email, the email system is working correctly!</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          StudentEvents - Event Management System<br>
          This is a test email sent from the backend API.
        </p>
      `
    };
    
    console.log(`📧 Sending test email to: ${to}`);
    console.log(`📧 From: ${msg.from}`);
    
    await sgMail.send(msg);
    console.log(`✅ Test email sent successfully to ${to}`);
    
    res.json({ 
      success: true, 
      message: 'Test email sent successfully',
      to: to,
      from: msg.from,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Test email failed:', error.message);
    if (error.response) {
      console.error('SendGrid Response:', error.response.body);
    }
    
    res.status(500).json({ 
      success: false,
      error: error.message,
      details: error.response ? error.response.body : null
    });
  }
});

module.exports = app;
