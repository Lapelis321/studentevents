import { Router } from 'express';
import { EventController } from '../controllers/eventController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', EventController.getAllEvents);
router.get('/:id', EventController.getEventById);

// Admin only routes
router.post('/', authenticateToken, requireAdmin, EventController.createEvent);
router.put('/:id', authenticateToken, requireAdmin, EventController.updateEvent);
router.delete('/:id', authenticateToken, requireAdmin, EventController.deleteEvent);
router.get('/admin/all', authenticateToken, requireAdmin, EventController.getAllEventsForAdmin);
router.get('/:id/stats', authenticateToken, requireAdmin, EventController.getEventStats);

export default router;
