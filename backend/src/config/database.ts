import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test the connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
  process.exit(-1);
});

export default pool;

// Database initialization and table creation
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'worker', 'user')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create events table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        date TIMESTAMP NOT NULL,
        location VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL DEFAULT 0,
        max_tickets INTEGER DEFAULT 1000,
        available_tickets INTEGER DEFAULT 1000,
        image_url VARCHAR(500),
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create tickets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
        qr_code VARCHAR(255) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'valid' CHECK (status IN ('valid', 'used', 'cancelled')),
        purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        used_date TIMESTAMP,
        stripe_payment_intent_id VARCHAR(255),
        amount_paid DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create workers table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS workers (
        id SERIAL PRIMARY KEY,
        event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, user_id)
      )
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
      CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);
      CREATE INDEX IF NOT EXISTS idx_tickets_qr_code ON tickets(qr_code);
      CREATE INDEX IF NOT EXISTS idx_workers_event_id ON workers(event_id);
      CREATE INDEX IF NOT EXISTS idx_workers_user_id ON workers(user_id);
      CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};
