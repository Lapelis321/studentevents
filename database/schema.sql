-- =====================================================
-- EVENT MANAGEMENT SYSTEM - DATABASE SCHEMA
-- =====================================================
-- Version: 1.0.0
-- Description: Complete database schema for event management platform
-- =====================================================

-- Drop existing tables if they exist (for clean rebuild)
DROP TABLE IF EXISTS policies CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS workers CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS admin CASCADE;

-- =====================================================
-- ADMIN TABLE
-- =====================================================
CREATE TABLE admin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster login queries
CREATE INDEX idx_admin_email ON admin(email);

-- =====================================================
-- EVENTS TABLE
-- =====================================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_tickets INTEGER NOT NULL DEFAULT 100,
  sold_tickets INTEGER DEFAULT 0,
  min_age INTEGER,
  dress_code VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'coming-soon', 'cancelled', 'completed-visible', 'completed-hidden')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(date);

-- =====================================================
-- BOOKINGS TABLE
-- =====================================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ticket_number VARCHAR(100) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  quantity INTEGER DEFAULT 1 CHECK (quantity >= 1),
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled', 'refunded')),
  payment_method VARCHAR(50) CHECK (payment_method IN ('stripe', 'bank-transfer', 'manual')),
  payment_reference VARCHAR(100),
  payment_deadline TIMESTAMP WITH TIME ZONE,
  additional_attendees JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX idx_bookings_event ON bookings(event_id);
CREATE INDEX idx_bookings_status ON bookings(payment_status);
CREATE INDEX idx_bookings_ticket ON bookings(ticket_number);
CREATE INDEX idx_bookings_email ON bookings(email);
CREATE INDEX idx_bookings_phone ON bookings(phone);

-- =====================================================
-- WORKERS TABLE
-- =====================================================
CREATE TABLE workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('worker', 'supervisor')),
  assigned_event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX idx_workers_email ON workers(email);
CREATE INDEX idx_workers_role ON workers(role);
CREATE INDEX idx_workers_assigned_event ON workers(assigned_event_id);

-- =====================================================
-- SETTINGS TABLE
-- =====================================================
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  category VARCHAR(50) CHECK (category IN ('payment', 'contact', 'organization', 'system')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster key lookups
CREATE INDEX idx_settings_key ON settings(key);
CREATE INDEX idx_settings_category ON settings(category);

-- =====================================================
-- POLICIES TABLE
-- =====================================================
CREATE TABLE policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) UNIQUE NOT NULL CHECK (type IN ('terms', 'privacy', 'guidelines', 'refund', 'conduct')),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_published BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster type lookups
CREATE INDEX idx_policies_type ON policies(type);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_admin_updated_at BEFORE UPDATE ON admin
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workers_updated_at BEFORE UPDATE ON workers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGER TO UPDATE SOLD TICKETS COUNT
-- =====================================================
CREATE OR REPLACE FUNCTION update_sold_tickets_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.payment_status = 'paid' THEN
    UPDATE events SET sold_tickets = sold_tickets + NEW.quantity WHERE id = NEW.event_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.payment_status != 'paid' AND NEW.payment_status = 'paid' THEN
    UPDATE events SET sold_tickets = sold_tickets + NEW.quantity WHERE id = NEW.event_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.payment_status = 'paid' AND NEW.payment_status != 'paid' THEN
    UPDATE events SET sold_tickets = sold_tickets - OLD.quantity WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' AND OLD.payment_status = 'paid' THEN
    UPDATE events SET sold_tickets = sold_tickets - OLD.quantity WHERE id = OLD.event_id;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_event_sold_tickets AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_sold_tickets_count();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE admin IS 'Stores administrator account credentials';
COMMENT ON TABLE events IS 'Stores all event information';
COMMENT ON TABLE bookings IS 'Stores ticket bookings and participant information';
COMMENT ON TABLE workers IS 'Stores worker and supervisor accounts';
COMMENT ON TABLE settings IS 'Stores system configuration settings';
COMMENT ON TABLE policies IS 'Stores policy and terms content';

-- =====================================================
-- END OF SCHEMA
-- =====================================================


