-- Phase 1 Migration: Coming Soon Status and Tickets Available Date
-- Add new fields to events table for Coming Soon functionality

-- Add tickets_available_date column
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS tickets_available_date DATE;

-- Add time column (separate from datetime)
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS time VARCHAR(50);

-- Update status check constraint to include 'coming-soon'
ALTER TABLE events 
DROP CONSTRAINT IF EXISTS events_status_check;

ALTER TABLE events 
ADD CONSTRAINT events_status_check 
CHECK (status IN ('active', 'coming-soon', 'sold-out', 'cancelled', 'completed', 'completed-shown'));

-- Add comment for clarity
COMMENT ON COLUMN events.tickets_available_date IS 'Date when tickets become available for purchase (for coming-soon events)';
COMMENT ON COLUMN events.time IS 'Event time separate from date field';

