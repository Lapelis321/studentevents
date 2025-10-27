-- Complete Database Fix - Adds all missing columns
-- Run this in Supabase SQL Editor

-- 1. FIX EVENTS TABLE - Add missing columns
DO $$ 
BEGIN
    -- Add status column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'status'
    ) THEN
        ALTER TABLE events ADD COLUMN status VARCHAR(50) DEFAULT 'active';
    END IF;

    -- Add is_active column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE events ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;

    -- Add min_age column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'min_age'
    ) THEN
        ALTER TABLE events ADD COLUMN min_age INTEGER;
    END IF;

    -- Add dress_code column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'dress_code'
    ) THEN
        ALTER TABLE events ADD COLUMN dress_code VARCHAR(100);
    END IF;

    -- Add currency column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'currency'
    ) THEN
        ALTER TABLE events ADD COLUMN currency VARCHAR(3) DEFAULT 'EUR';
    END IF;

    -- Add category column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'category'
    ) THEN
        ALTER TABLE events ADD COLUMN category VARCHAR(100);
    END IF;

    -- Add image_url column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE events ADD COLUMN image_url TEXT;
    END IF;

    -- Add updated_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE events ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- 2. CREATE TICKETS TABLE if it doesn't exist
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    attendee_name VARCHAR(255) NOT NULL,
    attendee_email VARCHAR(255) NOT NULL,
    attendee_phone VARCHAR(50),
    ticket_number VARCHAR(100) UNIQUE NOT NULL,
    qr_code TEXT,
    price_paid DECIMAL(10,2) NOT NULL,
    stripe_payment_intent_id VARCHAR(255),
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. CREATE WORKERS TABLE if it doesn't exist
CREATE TABLE IF NOT EXISTS workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'worker',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. CREATE USERS TABLE if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create or replace the update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Drop and recreate triggers
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Create indexes (safe - will skip if exists)
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_workers_email ON workers(email);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 8. Insert sample events (only if none exist)
INSERT INTO events (title, date, time, location, description, price, currency, total_tickets, available_tickets, category, min_age, dress_code, image_url, status)
SELECT 
    'Summer Beach Party 2024',
    '2024-08-15 20:00:00',
    '20:00',
    'Santa Monica Beach',
    'Join us for an unforgettable night by the ocean! Live DJs, beach volleyball, and bonfire.',
    15.00,
    'EUR',
    500,
    0,
    'Party',
    18,
    'Beach Casual',
    'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800',
    'completed-shown'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Summer Beach Party 2024');

INSERT INTO events (title, date, time, location, description, price, currency, total_tickets, available_tickets, category, min_age, dress_code, image_url, status)
SELECT 
    'Tech Startup Networking Night',
    '2025-01-25 18:30:00',
    '18:30',
    'Silicon Valley Hub, Downtown',
    'Connect with fellow entrepreneurs and innovators. Pitch sessions, mentorship, and drinks!',
    20.00,
    'EUR',
    150,
    100,
    'Networking',
    21,
    'Business Casual',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    'active'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Tech Startup Networking Night');

INSERT INTO events (title, date, time, location, description, price, currency, total_tickets, available_tickets, category, min_age, dress_code, image_url, status)
SELECT 
    'Electronic Music Festival 2025',
    '2025-03-10 22:00:00',
    '22:00',
    'Warehouse District',
    'Top international DJs, state-of-the-art sound system, and mind-blowing visuals.',
    35.00,
    'EUR',
    1000,
    0,
    'Festival',
    18,
    'Rave / Street',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
    'sold-out'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Electronic Music Festival 2025');

-- 9. Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS policies (drop if exist first)
DROP POLICY IF EXISTS "Events are viewable by everyone" ON events;
DROP POLICY IF EXISTS "Tickets are viewable by everyone" ON tickets;

CREATE POLICY "Events are viewable by everyone" ON events FOR SELECT USING (true);
CREATE POLICY "Tickets are viewable by everyone" ON tickets FOR SELECT USING (true);

-- ✅ Database is now fully configured!

