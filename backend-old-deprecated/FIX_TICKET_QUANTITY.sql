-- FIX TICKET QUANTITY ISSUE
-- This script manually fixes the ticket quantity issue by setting 600 tickets available
-- Run this in Supabase SQL Editor to fix the database

-- Update all events to have 600 total tickets and available tickets
UPDATE events 
SET 
    total_tickets = 600,
    available_tickets = 600
WHERE total_tickets = 100 OR total_tickets IS NULL;

-- Specifically fix the Fux After Party event
UPDATE events 
SET 
    total_tickets = 600,
    available_tickets = 600
WHERE id = '778b1766-4842-48c4-a423-74b9faa27891';

-- Specifically fix the AFTERSTATE x OPIUM event  
UPDATE events 
SET 
    total_tickets = 600,
    available_tickets = 600
WHERE id = 'bb9ad0bb-f38e-4722-bea6-39faedd0d3b9';

-- Verify the changes
SELECT 
    id,
    title,
    total_tickets,
    available_tickets,
    date,
    created_at
FROM events 
ORDER BY created_at DESC;

-- Show specific events that were updated
SELECT 
    id,
    title,
    total_tickets,
    available_tickets,
    date
FROM events 
WHERE id IN ('778b1766-4842-48c4-a423-74b9faa27891', 'bb9ad0bb-f38e-4722-bea6-39faedd0d3b9');
