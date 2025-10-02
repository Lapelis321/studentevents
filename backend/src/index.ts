import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database';
import { GoogleSheetsService } from './services/googleSheetsService';

// Import routes
import authRoutes from './routes/auth';
import eventRoutes from './routes/events';
import ticketRoutes from './routes/tickets';
import workerRoutes from './routes/workers';
import webhookRoutes from './routes/webhooks';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature']
}));

// Logging middleware
app.use(morgan('combined'));

// Raw body parser for Stripe webhooks (must be before express.json())
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'StudentEvents API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/webhooks', webhookRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The route ${req.method} ${req.originalUrl} does not exist`,
    availableRoutes: [
      'GET /health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/events',
      'POST /api/tickets/purchase',
      'POST /api/webhooks/stripe'
    ]
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Global error handler:', err);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: isDevelopment ? err.message : 'Something went wrong',
    ...(isDevelopment && { stack: err.stack })
  });
});

// Initialize services and start server
async function startServer() {
  try {
    console.log('🚀 Starting StudentEvents API server...');
    
    // Initialize database
    console.log('📊 Initializing database...');
    await initializeDatabase();
    
    // Initialize Google Sheets service
    console.log('📋 Initializing Google Sheets service...');
    await GoogleSheetsService.initialize();
    await GoogleSheetsService.createHeaderRow();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8000'}`);
      console.log('');
      console.log('📋 Available endpoints:');
      console.log('  Auth: /api/auth/*');
      console.log('  Events: /api/events/*');
      console.log('  Tickets: /api/tickets/*');
      console.log('  Workers: /api/workers/*');
      console.log('  Webhooks: /api/webhooks/*');
      console.log('');
      console.log('🎉 StudentEvents API is ready!');
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();
