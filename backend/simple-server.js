// Simple Railway server without problematic routes
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['https://afterstate.events', 'https://afterstateevents.netlify.app'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Events endpoint
app.get('/api/events', (req, res) => {
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
      totalTickets: 300,
      is_active: true
    }
  ];
  res.json(mockEvents);
});

// Admin login endpoint
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  if (email === 'admin@studentevents.com' && password === 'admin123') {
    res.json({
      success: true,
      token: 'mock-admin-token',
      user: {
        id: 'admin-1',
        email: 'admin@studentevents.com',
        role: 'admin'
      }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Worker login endpoint
app.post('/api/worker/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  if (email === 'john.worker@studentevents.com' && password === 'worker123') {
    res.json({
      success: true,
      token: 'mock-worker-token',
      user: {
        id: 'worker-1',
        email: 'john.worker@studentevents.com',
        role: 'worker'
      }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Base URL: http://localhost:${PORT}/api`);
  console.log(`✅ Admin credentials: admin@studentevents.com / admin123`);
  console.log(`✅ Worker credentials: john.worker@studentevents.com / worker123`);
});