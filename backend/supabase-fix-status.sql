-- Quick Fix: Add missing status column to existing events table
-- Run this FIRST in Supabase SQL Editor

-- 1. Add status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'status'
    ) THEN
        ALTER TABLE events ADD COLUMN status VARCHAR(50) DEFAULT 'active';
    END IF;
END $$;

-- 2. Add is_active column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE events ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- 3. Add min_age column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'min_age'
    ) THEN
        ALTER TABLE events ADD COLUMN min_age INTEGER;
    END IF;
END $$;

-- 4. Add dress_code column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'dress_code'
    ) THEN
        ALTER TABLE events ADD COLUMN dress_code VARCHAR(100);
    END IF;
END $$;

-- 5. Create index on status (safe - will skip if exists)
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- ✅ Status column added! Now run the main setup script.

