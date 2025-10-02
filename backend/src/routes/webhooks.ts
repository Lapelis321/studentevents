import { Router } from 'express';
import { WebhookController } from '../controllers/webhookController';

const router = Router();

// Stripe webhook endpoint (raw body needed for signature verification)
router.post('/stripe', WebhookController.handleStripeWebhook);

// Health check for webhook
router.get('/health', WebhookController.webhookHealth);

export default router;
