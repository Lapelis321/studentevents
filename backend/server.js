// Simple Express server for immediate deployment
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

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

// Mock ticket purchase
app.post('/api/tickets/purchase', (req, res) => {
  res.json({
    success: true,
    message: 'Ticket purchase successful (mock)',
    orderNumber: 'SE' + Date.now()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Health: http://localhost:${PORT}/health`);
  console.log(`📚 API: http://localhost:${PORT}/api`);
});
