// =====================================================
// EVENT MANAGEMENT SYSTEM - MAIN SERVER
// =====================================================
// Version: 2.0.0
// Description: Express server with PostgreSQL database
// =====================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Pool } = require('pg');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8000';

// =====================================================
// DATABASE CONNECTION
// =====================================================
const pool = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
}) : null;

// Test database connection
if (pool) {
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('❌ Database connection error:', err.message);
    } else {
      console.log('✅ Database connected successfully');
    }
  });
} else {
  console.warn('⚠️  No DATABASE_URL provided - running without database');
}

// Make pool available to routes
app.locals.pool = pool;

// =====================================================
// MIDDLEWARE
// =====================================================

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'https://afterstateevents.netlify.app',
    FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// =====================================================
// ROUTES
// =====================================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: pool ? 'connected' : 'not configured',
    backend_version: 'NEW-BACKEND-2.0.0'
  });
});

// Version check endpoint to verify which backend is deployed
app.get('/api/version', (req, res) => {
  res.json({
    version: '2.0.0',
    backend: 'NEW-BACKEND',
    timestamp: new Date().toISOString()
  });
});

// API root endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'StudentEvents API v2.0.0',
    status: 'online',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/admin/login, /api/worker/login',
      events: '/api/events',
      bookings: '/api/bookings',
      workers: '/api/workers',
      settings: '/api/settings',
      policies: '/api/policies'
    }
  });
});

// Import and use route modules
const authRoutes = require('./routes/auth');
const eventsRoutes = require('./routes/events');
const bookingsRoutes = require('./routes/bookings');
const workersRoutes = require('./routes/workers');
const settingsRoutes = require('./routes/settings');
const policiesRoutes = require('./routes/policies');
const paymentsRoutes = require('./routes/payments');
const uploadRoutes = require('./routes/upload');

// Register routes
app.use('/api/admin', authRoutes.adminRoutes);
app.use('/api/worker', authRoutes.workerRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/workers', workersRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/policies', policiesRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/upload', uploadRoutes);

// =====================================================
// ERROR HANDLING
// =====================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`,
    availableEndpoints: '/api'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal Server Error' : message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// =====================================================
// START SERVER
// =====================================================
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ====================================');
  console.log('   StudentEvents API Server v2.0.0');
  console.log('   ====================================');
  console.log(`   🌐 Server: http://localhost:${PORT}`);
  console.log(`   🏥 Health: http://localhost:${PORT}/health`);
  console.log(`   📚 API: http://localhost:${PORT}/api`);
  console.log(`   🔗 Frontend: ${FRONTEND_URL}`);
  console.log(`   🗄️  Database: ${pool ? 'Connected' : 'Not configured'}`);
  console.log(`   🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('   ====================================');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  if (pool) pool.end();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, closing server...');
  if (pool) pool.end();
  process.exit(0);
});

module.exports = app;


