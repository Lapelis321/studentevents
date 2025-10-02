import { Request, Response } from 'express';
import { TicketModel } from '../models/Ticket';
import { EventModel } from '../models/Event';
import { AuthRequest } from '../middleware/auth';
import { StripeService } from '../services/stripeService';
import { EmailService } from '../services/emailService';
import { GoogleSheetsService } from '../services/googleSheetsService';
import { generateTicketPDF } from '../utils/pdfGenerator';

export class TicketController {
  static async purchaseTicket(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { event_id } = req.body;

      if (!event_id) {
        res.status(400).json({ error: 'Event ID is required' });
        return;
      }

      const eventId = parseInt(event_id);
      if (isNaN(eventId)) {
        res.status(400).json({ error: 'Invalid event ID' });
        return;
      }

      // Check if event exists and is available
      const event = await EventModel.findById(eventId);
      if (!event) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }

      if (event.status !== 'active') {
        res.status(400).json({ error: 'Event is not available for ticket purchase' });
        return;
      }

      if (event.available_tickets <= 0) {
        res.status(400).json({ error: 'No tickets available for this event' });
        return;
      }

      // Check if event date has passed
      if (new Date(event.date) <= new Date()) {
        res.status(400).json({ error: 'Cannot purchase tickets for past events' });
        return;
      }

      // Create Stripe payment intent
      const paymentIntent = await StripeService.createPaymentIntent({
        amount: event.price,
        eventId: event.id,
        userId: req.user.id,
        userEmail: req.user.email,
        eventTitle: event.title
      });

      res.json({
        message: 'Payment intent created successfully',
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
        amount: event.price,
        event: {
          id: event.id,
          title: event.title,
          date: event.date,
          location: event.location,
          price: event.price
        }
      });
    } catch (error) {
      console.error('Purchase ticket error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async confirmTicketPurchase(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { payment_intent_id } = req.body;

      if (!payment_intent_id) {
        res.status(400).json({ error: 'Payment intent ID is required' });
        return;
      }

      // Retrieve payment intent from Stripe
      const paymentIntent = await StripeService.retrievePaymentIntent(payment_intent_id);

      if (paymentIntent.status !== 'succeeded') {
        res.status(400).json({ error: 'Payment not completed' });
        return;
      }

      // Check if ticket already exists for this payment intent
      const existingTicket = await TicketModel.findByStripePaymentIntent(payment_intent_id);
      if (existingTicket) {
        res.status(409).json({ error: 'Ticket already created for this payment' });
        return;
      }

      const eventId = parseInt(paymentIntent.metadata.eventId!);
      const amount = paymentIntent.amount / 100; // Convert from cents

      // Decrement available tickets
      const ticketReserved = await EventModel.decrementAvailableTickets(eventId);
      if (!ticketReserved) {
        res.status(400).json({ error: 'No tickets available' });
        return;
      }

      // Create ticket
      const ticket = await TicketModel.create({
        user_id: req.user.id,
        event_id: eventId,
        amount_paid: amount,
        stripe_payment_intent_id: payment_intent_id
      });

      // Get ticket with details for email
      const ticketWithDetails = await TicketModel.findByQRCode(ticket.qr_code);
      if (!ticketWithDetails) {
        res.status(500).json({ error: 'Failed to retrieve ticket details' });
        return;
      }

      // Send ticket email (don't wait for it)
      EmailService.sendTicketEmail(ticketWithDetails).catch(error => {
        console.error('Failed to send ticket email:', error);
      });

      // Sync to Google Sheets (don't wait for it)
      GoogleSheetsService.addTicketToSheet(ticketWithDetails).catch(error => {
        console.error('Failed to sync ticket to Google Sheets:', error);
      });

      res.json({
        message: 'Ticket purchased successfully',
        ticket: {
          id: ticket.id,
          qr_code: ticket.qr_code,
          status: ticket.status,
          amount_paid: ticket.amount_paid,
          purchase_date: ticket.purchase_date
        }
      });
    } catch (error) {
      console.error('Confirm ticket purchase error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getUserTickets(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const tickets = await TicketModel.findByUserId(req.user.id);

      res.json({
        message: 'Tickets retrieved successfully',
        tickets
      });
    } catch (error) {
      console.error('Get user tickets error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getTicketById(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { id } = req.params;
      const ticketId = parseInt(id!);

      if (isNaN(ticketId)) {
        res.status(400).json({ error: 'Invalid ticket ID' });
        return;
      }

      const ticket = await TicketModel.findById(ticketId);
      if (!ticket) {
        res.status(404).json({ error: 'Ticket not found' });
        return;
      }

      // Check if user owns this ticket or is admin/worker
      if (ticket.user_id !== req.user.id && !['admin', 'worker'].includes(req.user.role)) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const ticketWithDetails = await TicketModel.findByQRCode(ticket.qr_code);

      res.json({
        message: 'Ticket retrieved successfully',
        ticket: ticketWithDetails
      });
    } catch (error) {
      console.error('Get ticket error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async downloadTicket(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { id } = req.params;
      const ticketId = parseInt(id!);

      if (isNaN(ticketId)) {
        res.status(400).json({ error: 'Invalid ticket ID' });
        return;
      }

      const ticket = await TicketModel.findById(ticketId);
      if (!ticket) {
        res.status(404).json({ error: 'Ticket not found' });
        return;
      }

      // Check if user owns this ticket
      if (ticket.user_id !== req.user.id) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const ticketWithDetails = await TicketModel.findByQRCode(ticket.qr_code);
      if (!ticketWithDetails) {
        res.status(500).json({ error: 'Failed to retrieve ticket details' });
        return;
      }

      // Generate PDF
      const pdfBuffer = await generateTicketPDF(ticketWithDetails);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="ticket-${ticket.id}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Download ticket error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async validateTicket(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { qr_code } = req.body;

      if (!qr_code) {
        res.status(400).json({ error: 'QR code is required' });
        return;
      }

      const validation = await TicketModel.validateTicket(qr_code);

      if (!validation.valid) {
        res.status(400).json({
          valid: false,
          message: validation.message,
          ticket: validation.ticket
        });
        return;
      }

      // Mark ticket as used
      const usedTicket = await TicketModel.markAsUsed(qr_code);
      if (!usedTicket) {
        res.status(500).json({ error: 'Failed to mark ticket as used' });
        return;
      }

      // Update Google Sheets (don't wait for it)
      GoogleSheetsService.updateTicketStatus(usedTicket.id, 'used', new Date()).catch(error => {
        console.error('Failed to update ticket status in Google Sheets:', error);
      });

      res.json({
        valid: true,
        message: 'Ticket validated and marked as used',
        ticket: validation.ticket
      });
    } catch (error) {
      console.error('Validate ticket error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getAllTickets(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const tickets = await TicketModel.findAll();

      res.json({
        message: 'All tickets retrieved successfully',
        tickets
      });
    } catch (error) {
      console.error('Get all tickets error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getEventTickets(req: AuthRequest, res: Response): Promise<void> {
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

      const tickets = await TicketModel.findByEventId(eventId);

      res.json({
        message: 'Event tickets retrieved successfully',
        tickets
      });
    } catch (error) {
      console.error('Get event tickets error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getTicketStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const stats = await TicketModel.getTicketStats();

      res.json({
        message: 'Ticket statistics retrieved successfully',
        stats
      });
    } catch (error) {
      console.error('Get ticket stats error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
