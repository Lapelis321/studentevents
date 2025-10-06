// Clean Railway production server
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://afterstate.events';

// Middleware
app.use(cors({
  origin: [FRONTEND_URL, 'https://afterstate.events', 'https://afterstateevents.netlify.app'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

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

// Events endpoint
app.get('/api/events', async (req, res) => {
  try {
    if (process.env.DATABASE_URL) {
      // Use database
      const result = await pool.query('SELECT * FROM events WHERE is_active = true ORDER BY date ASC');
      res.json(result.rows);
    } else {
      // Use mock data
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
          totalTickets: 500,
          is_active: true
        }
      ];
      res.json(mockEvents);
    }
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
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
    
    // Check credentials
    if (email === 'john.worker@studentevents.com' && password === 'worker123') {
      const token = jwt.sign(
        { 
          id: 'worker-1', 
          email: 'john.worker@studentevents.com', 
          role: 'worker' 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      
      res.json({
        success: true,
        token,
        user: {
          id: 'worker-1',
          email: 'john.worker@studentevents.com',
          role: 'worker'
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

// Catch-all for undefined routes
app.all('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
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
