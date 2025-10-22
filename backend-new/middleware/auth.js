// =====================================================
// AUTHENTICATION MIDDLEWARE
// =====================================================

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';

/**
 * Verify JWT token and attach user to request
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Verify user is admin
 */
function verifyAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

/**
 * Verify user is worker or supervisor
 */
function verifyWorker(req, res, next) {
  if (!req.user || !['worker', 'supervisor'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Worker access required' });
  }
  next();
}

/**
 * Verify user is supervisor
 */
function verifySupervisor(req, res, next) {
  if (!req.user || req.user.role !== 'supervisor') {
    return res.status(403).json({ error: 'Supervisor access required' });
  }
  next();
}

/**
 * Combined middleware: verify token and admin role
 */
const requireAdmin = [verifyToken, verifyAdmin];

/**
 * Combined middleware: verify token and worker role
 */
const requireWorker = [verifyToken, verifyWorker];

/**
 * Combined middleware: verify token and supervisor role
 */
const requireSupervisor = [verifyToken, verifySupervisor];

module.exports = {
  verifyToken,
  verifyAdmin,
  verifyWorker,
  verifySupervisor,
  requireAdmin,
  requireWorker,
  requireSupervisor,
  JWT_SECRET
};


