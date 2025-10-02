import pool from '../config/database';

export interface Event {
  id: number;
  title: string;
  description: string;
  date: Date;
  location: string;
  price: number;
  max_tickets: number;
  available_tickets: number;
  image_url?: string;
  status: 'active' | 'cancelled' | 'completed';
  created_at: Date;
  updated_at: Date;
}

export interface CreateEventData {
  title: string;
  description: string;
  date: Date;
  location: string;
  price: number;
  max_tickets?: number;
  image_url?: string;
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  date?: Date;
  location?: string;
  price?: number;
  max_tickets?: number;
  image_url?: string;
  status?: 'active' | 'cancelled' | 'completed';
}

export class EventModel {
  static async create(eventData: CreateEventData): Promise<Event> {
    const { 
      title, 
      description, 
      date, 
      location, 
      price, 
      max_tickets = 1000, 
      image_url 
    } = eventData;

    const query = `
      INSERT INTO events (title, description, date, location, price, max_tickets, available_tickets, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $6, $7)
      RETURNING *
    `;

    const result = await pool.query(query, [
      title, 
      description, 
      date, 
      location, 
      price, 
      max_tickets, 
      image_url
    ]);
    
    return result.rows[0];
  }

  static async findAll(): Promise<Event[]> {
    const query = `
      SELECT * FROM events 
      WHERE status = 'active' AND date > NOW()
      ORDER BY date ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id: number): Promise<Event | null> {
    const query = 'SELECT * FROM events WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findAllForAdmin(): Promise<Event[]> {
    const query = 'SELECT * FROM events ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  static async update(id: number, updateData: UpdateEventData): Promise<Event | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE events 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM events WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount || 0) > 0;
  }

  static async decrementAvailableTickets(id: number, count: number = 1): Promise<boolean> {
    const query = `
      UPDATE events 
      SET available_tickets = available_tickets - $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND available_tickets >= $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [count, id]);
    return (result.rowCount || 0) > 0;
  }

  static async incrementAvailableTickets(id: number, count: number = 1): Promise<boolean> {
    const query = `
      UPDATE events 
      SET available_tickets = available_tickets + $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [count, id]);
    return (result.rowCount || 0) > 0;
  }

  static async getTicketsSold(id: number): Promise<number> {
    const query = `
      SELECT COUNT(*) as sold_count 
      FROM tickets 
      WHERE event_id = $1 AND status IN ('valid', 'used')
    `;
    
    const result = await pool.query(query, [id]);
    return parseInt(result.rows[0].sold_count);
  }

  static async getEventStats(id: number): Promise<{
    total_tickets: number;
    sold_tickets: number;
    used_tickets: number;
    available_tickets: number;
    revenue: number;
  }> {
    const query = `
      SELECT 
        e.max_tickets as total_tickets,
        e.available_tickets,
        COUNT(t.id) FILTER (WHERE t.status IN ('valid', 'used')) as sold_tickets,
        COUNT(t.id) FILTER (WHERE t.status = 'used') as used_tickets,
        COALESCE(SUM(t.amount_paid) FILTER (WHERE t.status IN ('valid', 'used')), 0) as revenue
      FROM events e
      LEFT JOIN tickets t ON e.id = t.event_id
      WHERE e.id = $1
      GROUP BY e.id, e.max_tickets, e.available_tickets
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || {
      total_tickets: 0,
      sold_tickets: 0,
      used_tickets: 0,
      available_tickets: 0,
      revenue: 0
    };
  }
}
