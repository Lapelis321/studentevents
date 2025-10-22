// =====================================================
// AUTHENTICATION ROUTES
// =====================================================

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

const adminRoutes = express.Router();
const workerRoutes = express.Router();

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// =====================================================
// ADMIN LOGIN
// =====================================================
adminRoutes.post('/login', async (req, res) => {
  const pool = req.app.locals.pool;
  
  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Query admin from database
    const result = await pool.query(
      'SELECT * FROM admin WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const admin = result.rows[0];
    
    // Verify password
    const isValid = await bcrypt.compare(password, admin.password_hash);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: 'admin'
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: admin.id,
        email: admin.email,
        fullName: admin.full_name,
        role: 'admin'
      }
    });
    
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// =====================================================
// WORKER/SUPERVISOR LOGIN
// =====================================================
workerRoutes.post('/login', async (req, res) => {
  const pool = req.app.locals.pool;
  
  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Query worker from database
    const result = await pool.query(
      'SELECT w.*, e.name as event_name FROM workers w LEFT JOIN events e ON w.assigned_event_id = e.id WHERE w.email = $1 AND w.is_active = true',
      [email.toLowerCase().trim()]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const worker = result.rows[0];
    
    // Verify password
    const isValid = await bcrypt.compare(password, worker.password_hash);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      {
        id: worker.id,
        email: worker.email,
        role: worker.role,
        assignedEventId: worker.assigned_event_id
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: worker.id,
        email: worker.email,
        fullName: worker.full_name,
        role: worker.role,
        assignedEventId: worker.assigned_event_id,
        assignedEventName: worker.event_name
      }
    });
    
  } catch (error) {
    console.error('Worker login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = {
  adminRoutes,
  workerRoutes
};


