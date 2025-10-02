import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface Ticket {
  id: number;
  user_id: number;
  event_id: number;
  qr_code: string;
  status: 'valid' | 'used' | 'cancelled';
  purchase_date: Date;
  used_date?: Date;
  stripe_payment_intent_id?: string;
  amount_paid: number;
  created_at: Date;
  updated_at: Date;
}

export interface TicketWithDetails extends Ticket {
  user_name: string;
  user_email: string;
  event_title: string;
  event_date: Date;
  event_location: string;
}

export interface CreateTicketData {
  user_id: number;
  event_id: number;
  amount_paid: number;
  stripe_payment_intent_id?: string;
}

export class TicketModel {
  static async create(ticketData: CreateTicketData): Promise<Ticket> {
    const { user_id, event_id, amount_paid, stripe_payment_intent_id } = ticketData;
    
    // Generate unique QR code
    const qr_code = `TICKET-${uuidv4()}`;

    const query = `
      INSERT INTO tickets (user_id, event_id, qr_code, amount_paid, stripe_payment_intent_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await pool.query(query, [
      user_id, 
      event_id, 
      qr_code, 
      amount_paid, 
      stripe_payment_intent_id
    ]);
    
    return result.rows[0];
  }

  static async findById(id: number): Promise<Ticket | null> {
    const query = 'SELECT * FROM tickets WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findByQRCode(qr_code: string): Promise<TicketWithDetails | null> {
    const query = `
      SELECT 
        t.*,
        u.name as user_name,
        u.email as user_email,
        e.title as event_title,
        e.date as event_date,
        e.location as event_location
      FROM tickets t
      JOIN users u ON t.user_id = u.id
      JOIN events e ON t.event_id = e.id
      WHERE t.qr_code = $1
    `;
    
    const result = await pool.query(query, [qr_code]);
    return result.rows[0] || null;
  }

  static async findByUserId(user_id: number): Promise<TicketWithDetails[]> {
    const query = `
      SELECT 
        t.*,
        u.name as user_name,
        u.email as user_email,
        e.title as event_title,
        e.date as event_date,
        e.location as event_location
      FROM tickets t
      JOIN users u ON t.user_id = u.id
      JOIN events e ON t.event_id = e.id
      WHERE t.user_id = $1
      ORDER BY t.created_at DESC
    `;
    
    const result = await pool.query(query, [user_id]);
    return result.rows;
  }

  static async findByEventId(event_id: number): Promise<TicketWithDetails[]> {
    const query = `
      SELECT 
        t.*,
        u.name as user_name,
        u.email as user_email,
        e.title as event_title,
        e.date as event_date,
        e.location as event_location
      FROM tickets t
      JOIN users u ON t.user_id = u.id
      JOIN events e ON t.event_id = e.id
      WHERE t.event_id = $1
      ORDER BY t.created_at DESC
    `;
    
    const result = await pool.query(query, [event_id]);
    return result.rows;
  }

  static async findAll(): Promise<TicketWithDetails[]> {
    const query = `
      SELECT 
        t.*,
        u.name as user_name,
        u.email as user_email,
        e.title as event_title,
        e.date as event_date,
        e.location as event_location
      FROM tickets t
      JOIN users u ON t.user_id = u.id
      JOIN events e ON t.event_id = e.id
      ORDER BY t.created_at DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  static async markAsUsed(qr_code: string): Promise<Ticket | null> {
    const query = `
      UPDATE tickets 
      SET status = 'used', 
          used_date = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE qr_code = $1 AND status = 'valid'
      RETURNING *
    `;
    
    const result = await pool.query(query, [qr_code]);
    return result.rows[0] || null;
  }

  static async cancel(id: number): Promise<Ticket | null> {
    const query = `
      UPDATE tickets 
      SET status = 'cancelled',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findByStripePaymentIntent(payment_intent_id: string): Promise<Ticket | null> {
    const query = 'SELECT * FROM tickets WHERE stripe_payment_intent_id = $1';
    const result = await pool.query(query, [payment_intent_id]);
    return result.rows[0] || null;
  }

  static async getTicketStats(): Promise<{
    total_tickets: number;
    valid_tickets: number;
    used_tickets: number;
    cancelled_tickets: number;
    total_revenue: number;
  }> {
    const query = `
      SELECT 
        COUNT(*) as total_tickets,
        COUNT(*) FILTER (WHERE status = 'valid') as valid_tickets,
        COUNT(*) FILTER (WHERE status = 'used') as used_tickets,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_tickets,
        COALESCE(SUM(amount_paid) FILTER (WHERE status IN ('valid', 'used')), 0) as total_revenue
      FROM tickets
    `;
    
    const result = await pool.query(query);
    return result.rows[0] || {
      total_tickets: 0,
      valid_tickets: 0,
      used_tickets: 0,
      cancelled_tickets: 0,
      total_revenue: 0
    };
  }

  static async validateTicket(qr_code: string): Promise<{
    valid: boolean;
    ticket?: TicketWithDetails;
    message: string;
  }> {
    const ticket = await this.findByQRCode(qr_code);
    
    if (!ticket) {
      return {
        valid: false,
        message: 'Ticket not found'
      };
    }

    if (ticket.status === 'used') {
      return {
        valid: false,
        ticket,
        message: 'Ticket already used'
      };
    }

    if (ticket.status === 'cancelled') {
      return {
        valid: false,
        ticket,
        message: 'Ticket has been cancelled'
      };
    }

    // Check if event date has passed
    if (new Date(ticket.event_date) < new Date()) {
      return {
        valid: false,
        ticket,
        message: 'Event has already ended'
      };
    }

    return {
      valid: true,
      ticket,
      message: 'Ticket is valid'
    };
  }
}
