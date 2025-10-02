import { Request, Response } from 'express';
import { WorkerModel } from '../models/Worker';
import { UserModel } from '../models/User';
import { EventModel } from '../models/Event';
import { AuthRequest } from '../middleware/auth';

export class WorkerController {
  static async assignWorker(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { event_id, user_id } = req.body;

      if (!event_id || !user_id) {
        res.status(400).json({ error: 'Event ID and User ID are required' });
        return;
      }

      const eventId = parseInt(event_id);
      const userId = parseInt(user_id);

      if (isNaN(eventId) || isNaN(userId)) {
        res.status(400).json({ error: 'Invalid event ID or user ID' });
        return;
      }

      // Check if event exists
      const event = await EventModel.findById(eventId);
      if (!event) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }

      // Check if user exists and has worker role
      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      if (user.role !== 'worker' && user.role !== 'admin') {
        res.status(400).json({ error: 'User must have worker or admin role' });
        return;
      }

      // Assign worker
      const worker = await WorkerModel.assignWorker(eventId, userId);

      res.json({
        message: 'Worker assigned successfully',
        worker
      });
    } catch (error) {
      console.error('Assign worker error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async removeWorker(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { event_id, user_id } = req.body;

      if (!event_id || !user_id) {
        res.status(400).json({ error: 'Event ID and User ID are required' });
        return;
      }

      const eventId = parseInt(event_id);
      const userId = parseInt(user_id);

      if (isNaN(eventId) || isNaN(userId)) {
        res.status(400).json({ error: 'Invalid event ID or user ID' });
        return;
      }

      const removed = await WorkerModel.removeWorker(eventId, userId);
      if (!removed) {
        res.status(404).json({ error: 'Worker assignment not found' });
        return;
      }

      res.json({ message: 'Worker removed successfully' });
    } catch (error) {
      console.error('Remove worker error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getEventWorkers(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { id } = req.params;
      const eventId = parseInt(id!);

      if (isNaN(eventId)) {
        res.status(400).json({ error: 'Invalid event ID' });
        return;
      }

      const workers = await WorkerModel.findByEventId(eventId);

      res.json({
        message: 'Event workers retrieved successfully',
        workers
      });
    } catch (error) {
      console.error('Get event workers error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getWorkerEvents(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      // Get events for the current user (worker)
      const events = await WorkerModel.getWorkerEvents(req.user.id);

      res.json({
        message: 'Worker events retrieved successfully',
        events
      });
    } catch (error) {
      console.error('Get worker events error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getAllWorkers(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const workers = await WorkerModel.findAll();

      res.json({
        message: 'All workers retrieved successfully',
        workers
      });
    } catch (error) {
      console.error('Get all workers error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getUserWorkerAssignments(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { id } = req.params;
      const userId = parseInt(id!);

      if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }

      // Check if requesting user is admin or the same user
      if (req.user.role !== 'admin' && req.user.id !== userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const assignments = await WorkerModel.findByUserId(userId);

      res.json({
        message: 'User worker assignments retrieved successfully',
        assignments
      });
    } catch (error) {
      console.error('Get user worker assignments error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async checkWorkerAssignment(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { event_id, user_id } = req.query;

      if (!event_id || !user_id) {
        res.status(400).json({ error: 'Event ID and User ID are required' });
        return;
      }

      const eventId = parseInt(event_id as string);
      const userId = parseInt(user_id as string);

      if (isNaN(eventId) || isNaN(userId)) {
        res.status(400).json({ error: 'Invalid event ID or user ID' });
        return;
      }

      const isAssigned = await WorkerModel.isWorkerAssigned(eventId, userId);

      res.json({
        message: 'Worker assignment status retrieved',
        is_assigned: isAssigned
      });
    } catch (error) {
      console.error('Check worker assignment error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getAvailableWorkers(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      // Get all users with worker role
      const workers = await UserModel.findByRole('worker');

      res.json({
        message: 'Available workers retrieved successfully',
        workers: workers.map(worker => ({
          id: worker.id,
          name: worker.name,
          email: worker.email,
          created_at: worker.created_at
        }))
      });
    } catch (error) {
      console.error('Get available workers error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
