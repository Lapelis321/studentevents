-- COMPREHENSIVE TICKET QUANTITY FIX
-- This script fixes the ticket quantity issue comprehensively
-- Run this in Supabase SQL Editor to fix the database

-- Step 1: Update all existing events to have 600 tickets
UPDATE events 
SET 
    total_tickets = 600,
    available_tickets = 600
WHERE total_tickets <= 100 OR total_tickets IS NULL;

-- Step 2: Set default values for future events
-- Update the default constraint for total_tickets column
ALTER TABLE events ALTER COLUMN total_tickets SET DEFAULT 600;
ALTER TABLE events ALTER COLUMN available_tickets SET DEFAULT 600;

-- Step 3: Ensure all events have proper ticket values
UPDATE events 
SET 
    total_tickets = COALESCE(total_tickets, 600),
    available_tickets = COALESCE(available_tickets, 600)
WHERE total_tickets IS NULL OR available_tickets IS NULL;

-- Step 4: Fix any events that might have been created with wrong defaults
UPDATE events 
SET 
    total_tickets = 600,
    available_tickets = 600
WHERE total_tickets < 600;

-- Step 5: Verify all changes
SELECT 
    id,
    title,
    total_tickets,
    available_tickets,
    date,
    created_at,
    updated_at
FROM events 
ORDER BY created_at DESC;

-- Step 6: Show summary of changes
SELECT 
    COUNT(*) as total_events,
    MIN(total_tickets) as min_tickets,
    MAX(total_tickets) as max_tickets,
    AVG(total_tickets) as avg_tickets
FROM events;
