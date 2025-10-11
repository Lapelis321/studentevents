// Clean Railway production server
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const sgMail = require('@sendgrid/mail');

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

// In-memory policy storage - Enhanced structure
let policyData = {
  metadata: {
    version: '1.0',
    lastUpdated: new Date().toISOString(),
    autoIncrementVersion: true,
    autoUpdateDate: true
  },
  sections: [
    {
      id: 'terms-of-service',
      title: 'Terms of Service',
      icon: 'fa-gavel',
      content: 'By accessing and using StudentEvents, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.',
      order: 1,
      visible: true,
      isDefault: true
    },
    {
      id: 'privacy-policy',
      title: 'Privacy Policy',
      icon: 'fa-shield-alt',
      content: 'We collect information you provide directly to us, such as when you create an account, purchase tickets, or contact us for support. We do not sell, trade, or otherwise transfer your personal information to third parties without your consent.',
      order: 2,
      visible: true,
      isDefault: true
    },
    {
      id: 'event-guidelines',
      title: 'Event Guidelines',
      icon: 'fa-calendar-check',
      content: 'Each event may have specific age requirements. Attendees must meet the minimum age requirement and may be asked to provide valid identification at the venue. The following items are generally prohibited: weapons, illegal substances, outside food and beverages, professional recording equipment, and large bags or backpacks.',
      order: 3,
      visible: true,
      isDefault: true
    },
    {
      id: 'ticket-policy',
      title: 'Ticket Policy',
      icon: 'fa-ticket-alt',
      content: 'Tickets are valid only for the specific event, date, and time indicated. Each ticket admits one person unless otherwise specified. Tickets may be transferred to another person, but the original purchaser remains responsible for ensuring the transferee complies with all terms and conditions.',
      order: 4,
      visible: true,
      isDefault: true
    },
    {
      id: 'refund-policy',
      title: 'Refund Policy',
      icon: 'fa-undo',
      content: 'Tickets may be cancelled and refunded up to 24 hours before the event start time. A processing fee may apply. Refunds are processed within 5-7 business days. If an event is cancelled by the organizer, full refunds will be provided automatically.',
      order: 5,
      visible: true,
      isDefault: true
    },
    {
      id: 'code-of-conduct',
      title: 'Code of Conduct',
      icon: 'fa-handshake',
      content: 'All attendees are expected to treat others with respect and courtesy. Harassment, discrimination, or disruptive behavior will not be tolerated. Attendees must follow all safety instructions and venue rules. Violation of the code of conduct may result in removal from the event without refund.',
      order: 6,
      visible: true,
      isDefault: true
    }
  ]
};

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
      res.json(result.rows);
    } else {
      // Use in-memory storage - return all events, let frontend filter
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
    const eventId = parseInt(req.params.id);
    const { title, date, location, price, description, additionalInfo, totalTickets, availableTickets, minAge, dressCode, currency, is_active } = req.body;
    
    if (pool) {
      // Update in database
      const result = await pool.query(
        `UPDATE events SET title = $1, date = $2, location = $3, price = $4, currency = $5, min_age = $6, 
         dress_code = $7, description = $8, additional_info = $9, total_tickets = $10, available_tickets = $11, is_active = $12 
         WHERE id = $13 RETURNING *`,
        [title, date, location, price, currency, minAge, dressCode, description, additionalInfo, totalTickets, availableTickets, is_active, eventId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      console.log(`✅ Event updated in database: ${title}`);
      res.json(result.rows[0]);
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
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// DELETE /api/events/:id - Delete event (admin only)
app.delete('/api/events/:id', verifyAdminToken, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    
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
    const discount = isISMStudent ? parseFloat(settings.ism_student_discount || '1.00') : 0;
    const unitPrice = basePrice;
    const totalAmount = (basePrice - discount) * quantity;

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

// GET /api/policy - Get policy data (public)
app.get('/api/policy', async (req, res) => {
  try {
    res.json(policyData);
    console.log(`📄 Policy data requested (version ${policyData.version})`);
  } catch (error) {
    console.error('Policy API error:', error);
    res.status(500).json({ error: 'Failed to fetch policy' });
  }
});

// PUT /api/policy - Update policy (admin only)
app.put('/api/policy', verifyAdminToken, async (req, res) => {
  try {
    const { metadata, sections } = req.body;
    
    // Update metadata
    if (metadata) {
      if (metadata.autoIncrementVersion !== false && policyData.metadata.autoIncrementVersion) {
        // Auto-increment version if enabled
        const currentVersion = parseFloat(policyData.metadata.version);
        policyData.metadata.version = (currentVersion + 0.1).toFixed(1);
      } else if (metadata.version) {
        // Manual version override
        policyData.metadata.version = metadata.version;
      }
      
      if (metadata.autoUpdateDate !== false && policyData.metadata.autoUpdateDate) {
        // Auto-update date if enabled
        policyData.metadata.lastUpdated = new Date().toISOString();
      } else if (metadata.lastUpdated) {
        // Manual date override
        policyData.metadata.lastUpdated = metadata.lastUpdated;
      }
      
      policyData.metadata.autoIncrementVersion = metadata.autoIncrementVersion !== false;
      policyData.metadata.autoUpdateDate = metadata.autoUpdateDate !== false;
    }
    
    // Update sections
    if (sections && Array.isArray(sections)) {
      policyData.sections = sections.map((section, index) => ({
        ...section,
        order: section.order !== undefined ? section.order : index + 1
      }));
    }
    
    console.log(`✅ Policy updated to version ${policyData.metadata.version}`);
    console.log(`📝 Total sections: ${policyData.sections.length} (${policyData.sections.filter(s => s.visible).length} visible)`);
    
    res.json(policyData);
  } catch (error) {
    console.error('Error updating policy:', error);
    res.status(500).json({ error: 'Failed to update policy' });
  }
});

// POST /api/policy/sections - Add new section (admin only)
app.post('/api/policy/sections', verifyAdminToken, async (req, res) => {
  try {
    const { title, icon, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    const newSection = {
      id: `custom-${Date.now()}`,
      title,
      icon: icon || 'fa-file-alt',
      content,
      order: policyData.sections.length + 1,
      visible: true,
      isDefault: false
    };
    
    policyData.sections.push(newSection);
    console.log(`✅ New section added: ${title} (Total: ${policyData.sections.length})`);
    
    res.json(newSection);
  } catch (error) {
    console.error('Error adding section:', error);
    res.status(500).json({ error: 'Failed to add section' });
  }
});

// DELETE /api/policy/sections/:id - Delete section (admin only, non-default only)
app.delete('/api/policy/sections/:id', verifyAdminToken, async (req, res) => {
  try {
    const sectionId = req.params.id;
    const sectionIndex = policyData.sections.findIndex(s => s.id === sectionId);
    
    if (sectionIndex === -1) {
      return res.status(404).json({ error: 'Section not found' });
    }
    
    if (policyData.sections[sectionIndex].isDefault) {
      return res.status(403).json({ error: 'Cannot delete default sections' });
    }
    
    const deletedSection = policyData.sections.splice(sectionIndex, 1)[0];
    console.log(`✅ Section deleted: ${deletedSection.title} (Remaining: ${policyData.sections.length})`);
    
    res.json({ success: true, message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({ error: 'Failed to delete section' });
  }
});

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
      email: process.env.FROM_EMAIL || 'noreply@studentevents.com', 
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
            <p>Questions? Contact us at support@studentevents.com</p>
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
  console.log(`✅ Admin credentials: admin@studentevents.com / admin123`);
  console.log(`✅ Worker credentials: john.worker@studentevents.com / worker123`);
});

module.exports = app;
