import { Router } from 'express';
import { TicketController } from '../controllers/ticketController';
import { authenticateToken, requireAdmin, requireWorker } from '../middleware/auth';

const router = Router();

// User routes
router.post('/purchase', authenticateToken, TicketController.purchaseTicket);
router.post('/confirm', authenticateToken, TicketController.confirmTicketPurchase);
router.get('/my-tickets', authenticateToken, TicketController.getUserTickets);
router.get('/:id', authenticateToken, TicketController.getTicketById);
router.get('/:id/download', authenticateToken, TicketController.downloadTicket);

// Worker routes
router.post('/validate', authenticateToken, requireWorker, TicketController.validateTicket);

// Admin routes
router.get('/admin/all', authenticateToken, requireAdmin, TicketController.getAllTickets);
router.get('/admin/stats', authenticateToken, requireAdmin, TicketController.getTicketStats);
router.get('/event/:id', authenticateToken, requireAdmin, TicketController.getEventTickets);

export default router;
