-- Supabase Database Setup for StudentEvents
-- Run these commands in your Supabase SQL Editor

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'worker')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Events table
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    additional_info TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'EUR',
    min_age INTEGER DEFAULT 18,
    dress_code VARCHAR(100),
    image_url TEXT,
    total_tickets INTEGER NOT NULL DEFAULT 100,
    available_tickets INTEGER NOT NULL DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attendee_name VARCHAR(255) NOT NULL,
    attendee_email VARCHAR(255) NOT NULL,
    attendee_phone VARCHAR(50),
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    qr_code TEXT,
    status VARCHAR(50) DEFAULT 'valid' CHECK (status IN ('valid', 'used', 'cancelled')),
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    price_paid DECIMAL(10,2) NOT NULL,
    stripe_payment_intent_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Workers table (for event staff)
CREATE TABLE IF NOT EXISTS workers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, event_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_workers_user_id ON workers(user_id);
CREATE INDEX IF NOT EXISTS idx_workers_event_id ON workers(event_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample admin user (password: admin123)
INSERT INTO users (name, email, password_hash, role) VALUES 
('Admin User', 'admin@studentevents.com', '$2a$10$rQ8K5O.6WX5uKz5K5O.6WOK5O.6WX5uKz5K5O.6WOK5O.6WX5uKz5K5O', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert sample events
INSERT INTO events (title, description, additional_info, date, location, price, currency, min_age, dress_code, image_url, total_tickets, available_tickets) VALUES 
('Spring Music Festival', 'Join us for an amazing night of live music featuring local and international artists.', 'Food trucks will be available on-site. Bring your student ID for verification. The event will feature multiple stages with different genres of music including rock, pop, electronic, and indie.', '2024-04-15 19:00:00+00', 'University Campus', 25.00, 'EUR', 18, 'Casual', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', 500, 150),
('Tech Innovation Summit', 'Explore the latest in technology and innovation with industry leaders.', 'Networking lunch included. Laptops recommended for workshops. The summit will cover topics including AI, blockchain, cybersecurity, and sustainable technology.', '2024-04-22 14:00:00+00', 'Convention Center', 15.00, 'EUR', 16, 'Business Casual', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', 300, 200),
('Art & Culture Night', 'An evening celebrating local artists and cultural diversity.', 'Wine and cheese reception included. Photography allowed. The event showcases works from emerging local artists, interactive installations, and live performances.', '2024-04-28 18:30:00+00', 'City Art Gallery', 12.00, 'EUR', 16, 'Smart Casual', 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800', 100, 80),
('Sports Championship Finals', 'Cheer for your favorite teams in the ultimate championship showdown.', 'Stadium food and beverages available. Team merchandise on sale. The championship features the top 4 teams competing in semi-finals and finals.', '2024-05-05 16:00:00+00', 'Stadium Arena', 30.00, 'EUR', 12, 'Casual', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800', 1000, 500),
('Comedy Night Special', 'Laugh the night away with top comedians and rising stars.', 'Two-drink minimum. Late seating not permitted after show starts. The lineup includes both established comedians and up-and-coming local talent.', '2024-05-12 20:00:00+00', 'Student Union Hall', 18.00, 'EUR', 18, 'Casual', NULL, 150, 120),
('Environmental Awareness Workshop', 'Learn about sustainability and environmental protection.', 'Materials provided. Certificate of participation available. The workshop covers practical sustainability tips, climate change awareness, and hands-on activities.', '2024-05-18 10:00:00+00', 'Science Building', 8.00, 'EUR', 14, 'Casual', NULL, 80, 60)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Everyone can read active events
CREATE POLICY "Anyone can read active events" ON events
    FOR SELECT USING (is_active = true);

-- Only admins can modify events
CREATE POLICY "Only admins can modify events" ON events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Users can read their own tickets
CREATE POLICY "Users can read own tickets" ON tickets
    FOR SELECT USING (user_id = auth.uid());

-- Users can create tickets for themselves
CREATE POLICY "Users can create own tickets" ON tickets
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Workers can read tickets for events they're assigned to
CREATE POLICY "Workers can read assigned event tickets" ON tickets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workers 
            WHERE workers.user_id = auth.uid() 
            AND workers.event_id = tickets.event_id
        )
    );

-- Workers can update ticket status for assigned events
CREATE POLICY "Workers can update assigned event tickets" ON tickets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM workers 
            WHERE workers.user_id = auth.uid() 
            AND workers.event_id = tickets.event_id
        )
    );

-- Only admins can manage workers
CREATE POLICY "Only admins can manage workers" ON workers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Workers can read their own assignments
CREATE POLICY "Workers can read own assignments" ON workers
    FOR SELECT USING (user_id = auth.uid());

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
