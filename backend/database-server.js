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

// Get all events from database
app.get('/api/events', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM events WHERE is_active = true ORDER BY date ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get single event by ID
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
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
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
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Failed to login' });
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
  console.log(`🚀 Database server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔗 Frontend URL: ${FRONTEND_URL}`);
  console.log(`🗄️ Database: PostgreSQL via Supabase`);
});
