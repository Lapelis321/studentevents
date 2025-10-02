import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/database';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    name: string;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Get user from database to ensure they still exist and get latest info
    const userResult = await pool.query(
      'SELECT id, email, role, name FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        error: `Access denied. Required roles: ${roles.join(', ')}` 
      });
      return;
    }

    next();
  };
};

export const requireAdmin = requireRole(['admin']);
export const requireWorker = requireRole(['worker', 'admin']);
export const requireUser = requireRole(['user', 'worker', 'admin']);
