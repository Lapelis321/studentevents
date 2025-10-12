-- ==============================================
-- CONSOLIDATED MIGRATIONS - RUN IN SUPABASE
-- ==============================================
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard
-- Project: vaoyiepnrizvvqokhcuu

-- ===== MIGRATION 1: Settings Enhancements =====
DO $$ BEGIN
    ALTER TABLE settings ADD COLUMN IF NOT EXISTS support_phone TEXT;
EXCEPTION
    WHEN duplicate_column THEN RAISE NOTICE 'column support_phone already exists.';
END $$;

DO $$ BEGIN
    ALTER TABLE settings ADD COLUMN IF NOT EXISTS support_working_hours TEXT;
EXCEPTION
    WHEN duplicate_column THEN RAISE NOTICE 'column support_working_hours already exists.';
END $$;

-- Insert default values
INSERT INTO settings (key, value, label) VALUES
    ('support_phone', '+370 600 00000', 'Support Phone Number')
ON CONFLICT (key) DO NOTHING;

INSERT INTO settings (key, value, label) VALUES
    ('support_working_hours', 'Mon-Fri 9:00-17:00', 'Support Working Hours')
ON CONFLICT (key) DO NOTHING;

-- ===== MIGRATION 2: Workers Table =====
CREATE TABLE IF NOT EXISTS workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'worker',
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_workers_email ON workers(email);
CREATE INDEX IF NOT EXISTS idx_workers_event_id ON workers(event_id);

-- Enable RLS
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;

-- ===== MIGRATION 3: Ticket Validation =====
DO $$ BEGIN
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS tickets_validated JSONB DEFAULT '[]';
EXCEPTION
    WHEN duplicate_column THEN RAISE NOTICE 'column tickets_validated already exists.';
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bookings_payment_reference ON bookings(payment_reference);

-- ===== VERIFICATION QUERIES =====
-- Run these to verify everything worked:

-- Check settings columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'settings' 
ORDER BY ordinal_position;

-- Check workers table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'workers'
);

-- Check bookings has tickets_validated column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bookings' AND column_name = 'tickets_validated';

-- ===== SUCCESS MESSAGE =====
DO $$ BEGIN
    RAISE NOTICE '✅ ALL MIGRATIONS COMPLETE!';
    RAISE NOTICE 'Your database is ready for testing.';
END $$;

