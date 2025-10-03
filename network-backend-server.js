// Network-enabled Express server for deployment
const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3001;

// Get network IP address
function getNetworkIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

const networkIP = getNetworkIP();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:8000',
    `http://${networkIP}:8000`,
    'http://127.0.0.1:8000'
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
    networkIP: networkIP
  });
});

// API endpoints
app.get('/api/events', (req, res) => {
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
    }
  ];
  
  res.json(events);
});

app.get('/api/events/:id', (req, res) => {
  const eventId = parseInt(req.params.id);
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
      additionalInfo: "Food trucks will be available on-site. Bring your student ID for verification. The event will feature multiple stages with different genres of music including rock, pop, electronic, and indie.",
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
      additionalInfo: "Networking lunch included. Laptops recommended for workshops. The summit will cover topics including AI, blockchain, cybersecurity, and sustainable technology.",
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
      additionalInfo: "Wine and cheese reception included. Photography allowed. The event showcases works from emerging local artists, interactive installations, and live performances.",
      availableTickets: 80,
      totalTickets: 100
    }
  ];
  
  const event = events.find(e => e.id === eventId);
  if (event) {
    res.json(event);
  } else {
    res.status(404).json({ error: 'Event not found' });
  }
});

// Basic auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple mock authentication
  if (email === 'admin@studentevents.com' && password === 'admin123') {
    res.json({
      success: true,
      token: 'mock-jwt-token',
      user: {
        id: 1,
        name: 'Admin User',
        email: 'admin@studentevents.com',
        role: 'admin'
      }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend server running on:`);
  console.log(`   Local:    http://localhost:${PORT}`);
  console.log(`   Network:  http://${networkIP}:${PORT}`);
  console.log(`🌐 Health check: http://${networkIP}:${PORT}/health`);
  console.log(`📚 API Base URL: http://${networkIP}:${PORT}/api`);
  console.log(`🔗 Frontend URL: http://${networkIP}:8000`);
});
