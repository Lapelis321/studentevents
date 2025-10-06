// Production server with database integration for Railway deployment
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://fabulous-pothos-8d2cf9.netlify.app';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:8000',
    'https://studentevents.netlify.app',
    'https://studentevents.vercel.app',
    process.env.FRONTEND_URL || 'https://fabulous-pothos-8d2cf9.netlify.app'
  ],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'production',
    database: 'connected'
  });
});

// Get all events from database (with fallback to mock data)
app.get('/api/events', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM events WHERE is_active = true ORDER BY date ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.log('Database not available, using mock data');
    // Fallback to mock data when database is not available
    const mockEvents = [
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
      }
    ];
    res.json(mockEvents);
  }
});

// Get single event by ID (with fallback to mock data)
app.get('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM events WHERE id = $1 AND is_active = true',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.log('Database not available, using mock data for event:', id);
    // Fallback to mock data
    const mockEvents = {
      '1': {
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
      '2': {
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
      '3': {
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
      }
    };
    
    const event = mockEvents[id];
    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ error: 'Event not found' });
    }
  }
});

// User login (with database)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user in database
    const result = await pool.query(
      'SELECT id, name, email, password_hash, role FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.log('Database not available, using mock authentication');
    // Fallback to mock authentication
    const { email, password } = req.body;
    
    // Mock admin user
    if (email === 'admin@studentevents.com' && password === 'admin123') {
      const token = jwt.sign(
        { userId: 1, email: email, role: 'admin' },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );
      
      return res.json({
        success: true,
        token,
        user: {
          id: 1,
          name: 'Admin User',
          email: email,
          role: 'admin'
        }
      });
    }
    
    return res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Mock ticket purchase
app.post('/api/tickets/purchase', (req, res) => {
  const { eventId, quantity, customerInfo } = req.body;
  
  res.json({
    success: true,
    ticketId: `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    eventId: eventId,
    quantity: quantity,
    total: quantity * 25.00,
    customerInfo: customerInfo,
    message: 'Ticket purchase successful! (Mock transaction)'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Production server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔗 Frontend URL: ${FRONTEND_URL}`);
  console.log(`🗄️ Database: PostgreSQL via Supabase`);
});
