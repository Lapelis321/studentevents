-- ==============================================
-- FIXED MIGRATIONS - RUN IN SUPABASE
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

-- ===== MIGRATION 2: Workers Table (FIXED ORDER) =====

-- First, create the table WITHOUT indexes
CREATE TABLE IF NOT EXISTS workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'worker',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Then, add the event_id column (references events table)
DO $$ BEGIN
    ALTER TABLE workers ADD COLUMN IF NOT EXISTS event_id UUID;
EXCEPTION
    WHEN duplicate_column THEN RAISE NOTICE 'column event_id already exists in workers.';
END $$;

-- Add the foreign key constraint
DO $$ BEGIN
    ALTER TABLE workers 
    ADD CONSTRAINT workers_event_id_fkey 
    FOREIGN KEY (event_id) 
    REFERENCES events(id) 
    ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN RAISE NOTICE 'foreign key workers_event_id_fkey already exists.';
END $$;

-- NOW create indexes (after column exists)
CREATE INDEX IF NOT EXISTS idx_workers_email ON workers(email);
CREATE INDEX IF NOT EXISTS idx_workers_event_id ON workers(event_id);

-- Enable RLS
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for workers
DO $$ BEGIN
    DROP POLICY IF EXISTS "Admin can manage workers" ON workers;
    CREATE POLICY "Admin can manage workers" 
    ON workers FOR ALL 
    USING (true);
EXCEPTION
    WHEN others THEN RAISE NOTICE 'Policy creation handled.';
END $$;

-- ===== MIGRATION 3: Ticket Validation =====
DO $$ BEGIN
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS tickets_validated JSONB DEFAULT '[]';
EXCEPTION
    WHEN duplicate_column THEN RAISE NOTICE 'column tickets_validated already exists.';
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bookings_payment_reference ON bookings(payment_reference);

-- ===== MIGRATION 4: Coming Soon Status =====
DO $$ BEGIN
    ALTER TABLE events ADD COLUMN IF NOT EXISTS tickets_available_date DATE;
EXCEPTION
    WHEN duplicate_column THEN RAISE NOTICE 'column tickets_available_date already exists.';
END $$;

-- ===== VERIFICATION QUERIES =====
-- Check settings columns
DO $$ BEGIN
    RAISE NOTICE '=== CHECKING SETTINGS TABLE ===';
END $$;

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'settings' 
ORDER BY ordinal_position;

-- Check workers table exists and structure
DO $$ BEGIN
    RAISE NOTICE '=== CHECKING WORKERS TABLE ===';
END $$;

SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'workers' 
ORDER BY ordinal_position;

-- Check workers indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'workers';

-- Check bookings has tickets_validated column
DO $$ BEGIN
    RAISE NOTICE '=== CHECKING BOOKINGS TABLE ===';
END $$;

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name IN ('tickets_validated', 'payment_reference');

-- Check events has tickets_available_date
DO $$ BEGIN
    RAISE NOTICE '=== CHECKING EVENTS TABLE ===';
END $$;

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'events' 
AND column_name = 'tickets_available_date';

-- ===== FINAL COUNT CHECK =====
DO $$ 
DECLARE
    workers_count INTEGER;
    events_count INTEGER;
    bookings_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO workers_count FROM workers;
    SELECT COUNT(*) INTO events_count FROM events;
    SELECT COUNT(*) INTO bookings_count FROM bookings;
    
    RAISE NOTICE '=== DATABASE STATISTICS ===';
    RAISE NOTICE 'Workers: %', workers_count;
    RAISE NOTICE 'Events: %', events_count;
    RAISE NOTICE 'Bookings: %', bookings_count;
    RAISE NOTICE '';
    RAISE NOTICE '✅ ALL MIGRATIONS COMPLETE!';
    RAISE NOTICE 'Your database is ready for testing.';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Verify no errors above';
    RAISE NOTICE '2. Check that workers table has event_id column';
    RAISE NOTICE '3. Start testing with LIVE_TESTING_NOW.md';
END $$;

