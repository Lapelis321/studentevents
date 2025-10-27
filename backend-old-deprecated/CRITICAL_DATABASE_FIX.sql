-- CRITICAL DATABASE FIX
-- This script fixes the persistent issues with min_age and dress_code values
-- Run this in Supabase SQL Editor to fix the database

-- Fix Fux After Party event
UPDATE events 
SET 
    min_age = 18,
    dress_code = 'Studio 54'
WHERE id = '778b1766-4842-48c4-a423-74b9faa27891';

-- Fix AFTERSTATE x OPIUM event
UPDATE events 
SET 
    min_age = 18,
    dress_code = 'Smart Casual'
WHERE id = 'bb9ad0bb-f38e-4722-bea6-39faedd0d3b9';

-- Fix any other events with default "No specific dress code" values
UPDATE events 
SET dress_code = 'Casual'
WHERE dress_code = 'No specific dress code';

-- Fix any events with null min_age to have a default value
UPDATE events 
SET min_age = 18
WHERE min_age IS NULL;

-- Verify the changes
SELECT id, title, min_age, dress_code, date FROM events 
ORDER BY created_at DESC;

-- Show current values for debugging
SELECT 
    id,
    title,
    min_age,
    dress_code,
    date,
    created_at
FROM events 
WHERE id IN ('778b1766-4842-48c4-a423-74b9faa27891', 'bb9ad0bb-f38e-4722-bea6-39faedd0d3b9');
