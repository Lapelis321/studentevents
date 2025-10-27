-- Fix existing events with default dress code values
-- This script updates events that have "No specific dress code" to proper values

-- Update Fux After Party event
UPDATE events 
SET dress_code = 'Studio 54'
WHERE id = '778b1766-4842-48c4-a423-74b9faa27891' 
AND dress_code = 'No specific dress code';

-- Update AFTERSTATE x OPIUM event
UPDATE events 
SET dress_code = 'Smart Casual'
WHERE id = 'bb9ad0bb-f38e-4722-bea6-39faedd0d3b9' 
AND dress_code = 'No specific dress code';

-- Verify the updates
SELECT id, title, min_age, dress_code FROM events WHERE id IN (
    '778b1766-4842-48c4-a423-74b9faa27891',
    'bb9ad0bb-f38e-4722-bea6-39faedd0d3b9'
);
