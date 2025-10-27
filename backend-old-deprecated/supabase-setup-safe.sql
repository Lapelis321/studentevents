-- Safe Database Setup - Only creates what doesn't exist
-- Run this in Supabase SQL Editor

-- 1. Create tables if they don't exist
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    date TIMESTAMP NOT NULL,
    time VARCHAR(50),
    location VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    total_tickets INTEGER NOT NULL,
    available_tickets INTEGER NOT NULL,
    category VARCHAR(100),
    min_age INTEGER,
    dress_code VARCHAR(100),
    image_url TEXT,
    status VARCHAR(50) DEFAULT 'active',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE IF NOT EXISTS workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'worker',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create update trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. Drop existing triggers if they exist (to avoid "already exists" error)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_events_updated_at ON events;

-- 4. Create triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_workers_email ON workers(email);

-- 6. Insert sample events (only if none exist)
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

-- 7. Enable Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;

-- 8. Create policies (drop if exist first)
DROP POLICY IF EXISTS "Events are viewable by everyone" ON events;
CREATE POLICY "Events are viewable by everyone" ON events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Tickets are viewable by everyone" ON tickets;
CREATE POLICY "Tickets are viewable by everyone" ON tickets FOR SELECT USING (true);

-- ✅ Done! Your database is now ready.

