import { Request, Response } from 'express';
import { StripeService } from '../services/stripeService';
import { TicketModel } from '../models/Ticket';
import { EventModel } from '../models/Event';
import { UserModel } from '../models/User';
import { EmailService } from '../services/emailService';
import { GoogleSheetsService } from '../services/googleSheetsService';

export class WebhookController {
  static async handleStripeWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['stripe-signature'] as string;
      
      if (!signature) {
        res.status(400).json({ error: 'Missing stripe signature' });
        return;
      }

      // Construct the event from the webhook payload
      const event = await StripeService.constructWebhookEvent(req.body, signature);

      console.log(`🔔 Stripe webhook received: ${event.type}`);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await WebhookController.handlePaymentSucceeded(event.data.object as any);
          break;

        case 'payment_intent.payment_failed':
          await WebhookController.handlePaymentFailed(event.data.object as any);
          break;

        case 'payment_intent.canceled':
          await WebhookController.handlePaymentCanceled(event.data.object as any);
          break;

        case 'checkout.session.completed':
          await WebhookController.handleCheckoutCompleted(event.data.object as any);
          break;

        default:
          console.log(`⚠️ Unhandled webhook event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('❌ Stripe webhook error:', error);
      res.status(400).json({ error: 'Webhook signature verification failed' });
    }
  }

  private static async handlePaymentSucceeded(paymentIntent: any): Promise<void> {
    try {
      console.log(`✅ Payment succeeded: ${paymentIntent.id}`);

      // Check if ticket already exists
      const existingTicket = await TicketModel.findByStripePaymentIntent(paymentIntent.id);
      if (existingTicket) {
        console.log(`⚠️ Ticket already exists for payment intent: ${paymentIntent.id}`);
        return;
      }

      const eventId = parseInt(paymentIntent.metadata.eventId);
      const userId = parseInt(paymentIntent.metadata.userId);
      const amount = paymentIntent.amount / 100; // Convert from cents

      // Verify event and user still exist
      const event = await EventModel.findById(eventId);
      const user = await UserModel.findById(userId);

      if (!event || !user) {
        console.error(`❌ Event or user not found for payment intent: ${paymentIntent.id}`);
        return;
      }

      // Check if tickets are still available
      if (event.available_tickets <= 0) {
        console.error(`❌ No tickets available for event: ${eventId}`);
        // In a real scenario, you might want to refund the payment here
        return;
      }

      // Decrement available tickets
      const ticketReserved = await EventModel.decrementAvailableTickets(eventId);
      if (!ticketReserved) {
        console.error(`❌ Failed to reserve ticket for event: ${eventId}`);
        return;
      }

      // Create ticket
      const ticket = await TicketModel.create({
        user_id: userId,
        event_id: eventId,
        amount_paid: amount,
        stripe_payment_intent_id: paymentIntent.id
      });

      console.log(`🎟️ Ticket created: ${ticket.id}`);

      // Get ticket with details for email
      const ticketWithDetails = await TicketModel.findByQRCode(ticket.qr_code);
      if (!ticketWithDetails) {
        console.error(`❌ Failed to retrieve ticket details: ${ticket.id}`);
        return;
      }

      // Send ticket email
      try {
        await EmailService.sendTicketEmail(ticketWithDetails);
        console.log(`📧 Ticket email sent to: ${user.email}`);
      } catch (error) {
        console.error('❌ Failed to send ticket email:', error);
      }

      // Sync to Google Sheets
      try {
        await GoogleSheetsService.addTicketToSheet(ticketWithDetails);
        console.log(`📊 Ticket synced to Google Sheets: ${ticket.id}`);
      } catch (error) {
        console.error('❌ Failed to sync ticket to Google Sheets:', error);
      }

    } catch (error) {
      console.error('❌ Error handling payment succeeded:', error);
    }
  }

  private static async handlePaymentFailed(paymentIntent: any): Promise<void> {
    try {
      console.log(`❌ Payment failed: ${paymentIntent.id}`);
      
      // Log the failure for monitoring
      console.log(`Payment failed for user: ${paymentIntent.metadata.userId}, event: ${paymentIntent.metadata.eventId}`);
      
      // You might want to send a notification email to the user about the failed payment
      // or implement retry logic here
      
    } catch (error) {
      console.error('❌ Error handling payment failed:', error);
    }
  }

  private static async handlePaymentCanceled(paymentIntent: any): Promise<void> {
    try {
      console.log(`🚫 Payment canceled: ${paymentIntent.id}`);
      
      // Log the cancellation for monitoring
      console.log(`Payment canceled for user: ${paymentIntent.metadata.userId}, event: ${paymentIntent.metadata.eventId}`);
      
      // Clean up any reserved resources if needed
      
    } catch (error) {
      console.error('❌ Error handling payment canceled:', error);
    }
  }

  private static async handleCheckoutCompleted(session: any): Promise<void> {
    try {
      console.log(`✅ Checkout session completed: ${session.id}`);

      // If using Stripe Checkout instead of Payment Intents
      // You can handle the checkout completion here
      
      if (session.payment_intent) {
        // Get the payment intent and handle it
        const paymentIntent = await StripeService.retrievePaymentIntent(session.payment_intent);
        await WebhookController.handlePaymentSucceeded(paymentIntent);
      }

    } catch (error) {
      console.error('❌ Error handling checkout completed:', error);
    }
  }

  // Health check endpoint for webhook
  static async webhookHealth(req: Request, res: Response): Promise<void> {
    res.json({ 
      status: 'ok', 
      message: 'Stripe webhook endpoint is healthy',
      timestamp: new Date().toISOString()
    });
  }
}
