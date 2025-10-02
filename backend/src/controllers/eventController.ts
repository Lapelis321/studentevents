import { Request, Response } from 'express';
import { EventModel } from '../models/Event';
import { AuthRequest } from '../middleware/auth';

export class EventController {
  static async getAllEvents(req: Request, res: Response): Promise<void> {
    try {
      const events = await EventModel.findAll();
      
      res.json({
        message: 'Events retrieved successfully',
        events
      });
    } catch (error) {
      console.error('Get events error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getEventById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const eventId = parseInt(id!);

      if (isNaN(eventId)) {
        res.status(400).json({ error: 'Invalid event ID' });
        return;
      }

      const event = await EventModel.findById(eventId);
      if (!event) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }

      // Get event statistics
      const stats = await EventModel.getEventStats(eventId);

      res.json({
        message: 'Event retrieved successfully',
        event: {
          ...event,
          stats
        }
      });
    } catch (error) {
      console.error('Get event error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async createEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { title, description, date, location, price, max_tickets, image_url } = req.body;

      // Validation
      if (!title || !description || !date || !location || price === undefined) {
        res.status(400).json({ 
          error: 'Title, description, date, location, and price are required' 
        });
        return;
      }

      if (price < 0) {
        res.status(400).json({ error: 'Price cannot be negative' });
        return;
      }

      if (max_tickets && max_tickets < 1) {
        res.status(400).json({ error: 'Max tickets must be at least 1' });
        return;
      }

      // Check if date is in the future
      const eventDate = new Date(date);
      if (eventDate <= new Date()) {
        res.status(400).json({ error: 'Event date must be in the future' });
        return;
      }

      const event = await EventModel.create({
        title,
        description,
        date: eventDate,
        location,
        price: parseFloat(price),
        max_tickets: max_tickets ? parseInt(max_tickets) : 1000,
        image_url
      });

      res.status(201).json({
        message: 'Event created successfully',
        event
      });
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateEvent(req: AuthRequest, res: Response): Promise<void> {
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

      const { title, description, date, location, price, max_tickets, image_url, status } = req.body;

      // Validate date if provided
      if (date) {
        const eventDate = new Date(date);
        if (eventDate <= new Date()) {
          res.status(400).json({ error: 'Event date must be in the future' });
          return;
        }
      }

      // Validate price if provided
      if (price !== undefined && price < 0) {
        res.status(400).json({ error: 'Price cannot be negative' });
        return;
      }

      // Validate max_tickets if provided
      if (max_tickets !== undefined && max_tickets < 1) {
        res.status(400).json({ error: 'Max tickets must be at least 1' });
        return;
      }

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (date !== undefined) updateData.date = new Date(date);
      if (location !== undefined) updateData.location = location;
      if (price !== undefined) updateData.price = parseFloat(price);
      if (max_tickets !== undefined) updateData.max_tickets = parseInt(max_tickets);
      if (image_url !== undefined) updateData.image_url = image_url;
      if (status !== undefined) updateData.status = status;

      const event = await EventModel.update(eventId, updateData);
      if (!event) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }

      res.json({
        message: 'Event updated successfully',
        event
      });
    } catch (error) {
      console.error('Update event error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async deleteEvent(req: AuthRequest, res: Response): Promise<void> {
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

      const deleted = await EventModel.delete(eventId);
      if (!deleted) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }

      res.json({ message: 'Event deleted successfully' });
    } catch (error) {
      console.error('Delete event error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getAllEventsForAdmin(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const events = await EventModel.findAllForAdmin();
      
      // Get stats for each event
      const eventsWithStats = await Promise.all(
        events.map(async (event) => {
          const stats = await EventModel.getEventStats(event.id);
          return { ...event, stats };
        })
      );

      res.json({
        message: 'Events retrieved successfully',
        events: eventsWithStats
      });
    } catch (error) {
      console.error('Get admin events error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getEventStats(req: AuthRequest, res: Response): Promise<void> {
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

      const event = await EventModel.findById(eventId);
      if (!event) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }

      const stats = await EventModel.getEventStats(eventId);

      res.json({
        message: 'Event statistics retrieved successfully',
        stats
      });
    } catch (error) {
      console.error('Get event stats error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
