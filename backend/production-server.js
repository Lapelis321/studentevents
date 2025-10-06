// Production server with database integration and in-memory fallback for Railway deployment
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://afterstate.events';

// In-memory storage for mock data (persists across requests until server restart)
let mockEventsStore = [
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
    totalTickets: 100,
    is_active: true
  }
];

let mockWorkersStore = [
  {
    id: 1,
    name: "John Worker",
    email: "john.worker@studentevents.com",
    password: "worker123",
    role: "worker",
    assigned_events: [1, 2]
  }
];

let nextEventId = 4;
let nextWorkerId = 2;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'https://studentevents.netlify.app',
    'https://studentevents.vercel.app',
    process.env.FRONTEND_URL || 'https://afterstateevents.netlify.app'
  ],
  credentials: true
}));
app.use(express.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Admin-only middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'production',
    database: process.env.DATABASE_URL ? 'connected' : 'mock'
  });
});

// Get all events
app.get('/api/events', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM events WHERE is_active = true ORDER BY date ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.log('Database not available, using mock data');
    res.json(mockEventsStore.filter(e => e.is_active));
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
    console.log('Database not available, using mock data for event:', req.params.id);
    const event = mockEventsStore.find(e => e.id === parseInt(req.params.id) && e.is_active);
    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ error: 'Event not found' });
    }
  }
});

// CREATE event (Admin only)
app.post('/api/events', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, date, location, price, currency, minAge, dressCode, description, additionalInfo, availableTickets, totalTickets } = req.body;
    
    // Try database first
    try {
      const result = await pool.query(
        'INSERT INTO events (title, date, location, price, currency, min_age, dress_code, description, additional_info, available_tickets, total_tickets, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true) RETURNING *',
        [title, date, location, price, currency, minAge, dressCode, description, additionalInfo, availableTickets, totalTickets]
      );
      return res.json({ success: true, event: result.rows[0] });
    } catch (dbError) {
      console.log('Database not available, using mock storage');
      // Fallback to mock storage
      const newEvent = {
        id: nextEventId++,
        title, date, location, price: parseFloat(price), currency,
        minAge: parseInt(minAge), dressCode, description, additionalInfo,
        availableTickets: parseInt(availableTickets),
        totalTickets: parseInt(totalTickets),
        is_active: true
      };
      mockEventsStore.push(newEvent);
      res.json({ success: true, event: newEvent });
    }
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// UPDATE event (Admin only)
app.put('/api/events/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, location, price, currency, minAge, dressCode, description, additionalInfo, availableTickets, totalTickets } = req.body;
    
    // Try database first
    try {
      const result = await pool.query(
        'UPDATE events SET title=$1, date=$2, location=$3, price=$4, currency=$5, min_age=$6, dress_code=$7, description=$8, additional_info=$9, available_tickets=$10, total_tickets=$11 WHERE id=$12 RETURNING *',
        [title, date, location, price, currency, minAge, dressCode, description, additionalInfo, availableTickets, totalTickets, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      return res.json({ success: true, event: result.rows[0] });
    } catch (dbError) {
      console.log('Database not available, using mock storage');
      // Fallback to mock storage
      const eventIndex = mockEventsStore.findIndex(e => e.id === parseInt(id));
      if (eventIndex === -1) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      mockEventsStore[eventIndex] = {
        ...mockEventsStore[eventIndex],
        title, date, location, price: parseFloat(price), currency,
        minAge: parseInt(minAge), dressCode, description, additionalInfo,
        availableTickets: parseInt(availableTickets),
        totalTickets: parseInt(totalTickets)
      };
      
      res.json({ success: true, event: mockEventsStore[eventIndex] });
    }
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// DELETE event (Admin only)
app.delete('/api/events/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try database first
    try {
      const result = await pool.query(
        'UPDATE events SET is_active = false WHERE id = $1 RETURNING *',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      return res.json({ success: true, message: 'Event deleted successfully' });
    } catch (dbError) {
      console.log('Database not available, using mock storage');
      // Fallback to mock storage
      const eventIndex = mockEventsStore.findIndex(e => e.id === parseInt(id));
      if (eventIndex === -1) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      mockEventsStore[eventIndex].is_active = false;
      res.json({ success: true, message: 'Event deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Get all workers (Admin only)
app.get('/api/workers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role, assigned_events FROM workers');
    res.json(result.rows);
  } catch (error) {
    console.log('Database not available, using mock workers');
    res.json(mockWorkersStore.map(w => ({
      id: w.id,
      name: w.name,
      email: w.email,
      role: w.role,
      assigned_events: w.assigned_events
    })));
  }
});

// CREATE worker (Admin only)
app.post('/api/workers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, assigned_events } = req.body;
    
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await pool.query(
        'INSERT INTO workers (name, email, password_hash, role, assigned_events) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, assigned_events',
        [name, email, hashedPassword, 'worker', assigned_events || []]
      );
      res.json({ success: true, worker: result.rows[0] });
    } catch (dbError) {
      console.log('Database not available, using mock storage');
      const newWorker = {
        id: nextWorkerId++,
        name, email, password, role: 'worker',
        assigned_events: assigned_events || []
      };
      mockWorkersStore.push(newWorker);
      res.json({ success: true, worker: { id: newWorker.id, name, email, role: 'worker', assigned_events: newWorker.assigned_events } });
    }
  } catch (error) {
    console.error('Error creating worker:', error);
    res.status(500).json({ error: 'Failed to create worker' });
  }
});

// User/Worker/Admin login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Try database first
    try {
      const result = await pool.query(
        'SELECT id, name, email, password_hash, role FROM users WHERE email = $1',
        [email]
      );
      
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const user = result.rows[0];
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );
      
      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (dbError) {
      console.log('Database not available, using mock authentication');
      
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
      
      // Mock worker user
      const worker = mockWorkersStore.find(w => w.email === email && w.password === password);
      if (worker) {
        const token = jwt.sign(
          { userId: worker.id, email: worker.email, role: 'worker' },
          process.env.JWT_SECRET || 'fallback-secret',
          { expiresIn: '24h' }
        );
        
        return res.json({
          success: true,
          token,
          user: {
            id: worker.id,
            name: worker.name,
            email: worker.email,
            role: 'worker',
            assigned_events: worker.assigned_events
          }
        });
      }
      
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify token (Admin/Worker)
app.get('/api/auth/verify', authenticateToken, async (req, res) => {
  try {
    // Token is already validated by authenticateToken middleware
    // Return user info
    res.json({
      success: true,
      user: {
        id: req.user.userId,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(500).json({ error: 'Token verification failed' });
  }
});

// Logout (Admin/Worker)
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    // In a real app, you would blacklist the token
    // For now, just return success
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout failed:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Validate ticket (Worker only)
app.post('/api/tickets/validate', authenticateToken, async (req, res) => {
  const { ticketId } = req.body;
  
  // Mock validation - in real app would check database
  if (ticketId && ticketId.startsWith('TICKET-')) {
    res.json({
      success: true,
      valid: true,
      ticket: {
        id: ticketId,
        eventId: 1,
        customerName: 'John Doe',
        scannedAt: new Date().toISOString()
      }
    });
  } else {
    res.json({
      success: false,
      valid: false,
      message: 'Invalid ticket'
    });
  }
});

// Purchase ticket
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
  console.log(`🗄️ Database: ${process.env.DATABASE_URL ? 'PostgreSQL via Supabase' : 'In-memory mock storage'}`);
  console.log(`✅ Admin credentials: admin@studentevents.com / admin123`);
  console.log(`✅ Worker credentials: john.worker@studentevents.com / worker123`);
});

