-- FINAL DATABASE FIX - Update all events with proper values
-- This will fix the remaining "undefined" and dress code issues

-- Update Fux After Party event with correct dress code
UPDATE events 
SET 
    min_age = 18,
    dress_code = 'Studio 54'
WHERE id = '778b1766-4842-48c4-a423-74b9faa27891';

-- Update AFTERSTATE x OPIUM event (already correct, but ensure it's set)
UPDATE events 
SET 
    min_age = 18,
    dress_code = 'Smart Casual'
WHERE id = 'bb9ad0bb-f38e-4722-bea6-39faedd0d3b9';

-- Verify the updates
SELECT id, title, min_age, dress_code FROM events WHERE id IN (
    '778b1766-4842-48c4-a423-74b9faa27891',
    'bb9ad0bb-f38e-4722-bea6-39faedd0d3b9'
);
