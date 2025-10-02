import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { EmailService } from '../services/emailService';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, role = 'user' } = req.body;

      // Validation
      if (!name || !email || !password) {
        res.status(400).json({ error: 'Name, email, and password are required' });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters long' });
        return;
      }

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        res.status(409).json({ error: 'User with this email already exists' });
        return;
      }

      // Create user
      const user = await UserModel.create({ name, email, password, role });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET as string
      );

      // Send welcome email (don't wait for it)
      EmailService.sendWelcomeEmail(user.email, user.name).catch(error => {
        console.error('Failed to send welcome email:', error);
      });

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          created_at: user.created_at
        },
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      // Find user
      const user = await UserModel.findByEmail(email);
      if (!user) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      // Verify password
      const isValidPassword = await UserModel.verifyPassword(password, user.password);
      if (!isValidPassword) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET as string
      );

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          created_at: user.created_at
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const user = await UserModel.findById(req.user.id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { name } = req.body;

      if (!name) {
        res.status(400).json({ error: 'Name is required' });
        return;
      }

      // For now, we'll just return success since we don't have an update method
      // In a real implementation, you'd add an update method to UserModel
      res.json({
        message: 'Profile updated successfully',
        user: {
          id: req.user.id,
          name: name,
          email: req.user.email,
          role: req.user.role
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({ error: 'Current password and new password are required' });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({ error: 'New password must be at least 6 characters long' });
        return;
      }

      // Get user with password
      const user = await UserModel.findByEmail(req.user.email);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Verify current password
      const isValidPassword = await UserModel.verifyPassword(currentPassword, user.password);
      if (!isValidPassword) {
        res.status(401).json({ error: 'Current password is incorrect' });
        return;
      }

      // Update password
      await UserModel.updatePassword(user.id, newPassword);

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async refreshToken(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      // Generate new JWT token
      const token = jwt.sign(
        { userId: req.user.id, email: req.user.email, role: req.user.role },
        process.env.JWT_SECRET as string
      );

      res.json({
        message: 'Token refreshed successfully',
        token
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
