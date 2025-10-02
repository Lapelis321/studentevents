import { Router } from 'express';
import { WorkerController } from '../controllers/workerController';
import { authenticateToken, requireAdmin, requireWorker } from '../middleware/auth';

const router = Router();

// Admin only routes
router.post('/assign', authenticateToken, requireAdmin, WorkerController.assignWorker);
router.delete('/remove', authenticateToken, requireAdmin, WorkerController.removeWorker);
router.get('/all', authenticateToken, requireAdmin, WorkerController.getAllWorkers);
router.get('/available', authenticateToken, requireAdmin, WorkerController.getAvailableWorkers);
router.get('/check', authenticateToken, requireAdmin, WorkerController.checkWorkerAssignment);
router.get('/user/:id', authenticateToken, requireAdmin, WorkerController.getUserWorkerAssignments);

// Worker routes
router.get('/my-events', authenticateToken, requireWorker, WorkerController.getWorkerEvents);

// Admin and Worker routes
router.get('/event/:id', authenticateToken, requireWorker, WorkerController.getEventWorkers);

export default router;
