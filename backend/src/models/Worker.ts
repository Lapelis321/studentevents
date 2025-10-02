import pool from '../config/database';

export interface Worker {
  id: number;
  event_id: number;
  user_id: number;
  assigned_at: Date;
}

export interface WorkerWithDetails extends Worker {
  user_name: string;
  user_email: string;
  event_title: string;
  event_date: Date;
  event_location: string;
}

export class WorkerModel {
  static async assignWorker(event_id: number, user_id: number): Promise<Worker> {
    const query = `
      INSERT INTO workers (event_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (event_id, user_id) DO UPDATE SET assigned_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result = await pool.query(query, [event_id, user_id]);
    return result.rows[0];
  }

  static async removeWorker(event_id: number, user_id: number): Promise<boolean> {
    const query = 'DELETE FROM workers WHERE event_id = $1 AND user_id = $2';
    const result = await pool.query(query, [event_id, user_id]);
    return (result.rowCount || 0) > 0;
  }

  static async findByEventId(event_id: number): Promise<WorkerWithDetails[]> {
    const query = `
      SELECT 
        w.*,
        u.name as user_name,
        u.email as user_email,
        e.title as event_title,
        e.date as event_date,
        e.location as event_location
      FROM workers w
      JOIN users u ON w.user_id = u.id
      JOIN events e ON w.event_id = e.id
      WHERE w.event_id = $1
      ORDER BY w.assigned_at DESC
    `;
    
    const result = await pool.query(query, [event_id]);
    return result.rows;
  }

  static async findByUserId(user_id: number): Promise<WorkerWithDetails[]> {
    const query = `
      SELECT 
        w.*,
        u.name as user_name,
        u.email as user_email,
        e.title as event_title,
        e.date as event_date,
        e.location as event_location
      FROM workers w
      JOIN users u ON w.user_id = u.id
      JOIN events e ON w.event_id = e.id
      WHERE w.user_id = $1
      ORDER BY w.assigned_at DESC
    `;
    
    const result = await pool.query(query, [user_id]);
    return result.rows;
  }

  static async findAll(): Promise<WorkerWithDetails[]> {
    const query = `
      SELECT 
        w.*,
        u.name as user_name,
        u.email as user_email,
        e.title as event_title,
        e.date as event_date,
        e.location as event_location
      FROM workers w
      JOIN users u ON w.user_id = u.id
      JOIN events e ON w.event_id = e.id
      ORDER BY w.assigned_at DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  static async isWorkerAssigned(event_id: number, user_id: number): Promise<boolean> {
    const query = 'SELECT 1 FROM workers WHERE event_id = $1 AND user_id = $2';
    const result = await pool.query(query, [event_id, user_id]);
    return result.rows.length > 0;
  }

  static async getWorkerEvents(user_id: number): Promise<WorkerWithDetails[]> {
    const query = `
      SELECT 
        w.*,
        u.name as user_name,
        u.email as user_email,
        e.title as event_title,
        e.date as event_date,
        e.location as event_location
      FROM workers w
      JOIN users u ON w.user_id = u.id
      JOIN events e ON w.event_id = e.id
      WHERE w.user_id = $1 AND e.date >= CURRENT_DATE
      ORDER BY e.date ASC
    `;
    
    const result = await pool.query(query, [user_id]);
    return result.rows;
  }
}
