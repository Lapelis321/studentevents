-- COMPLETE DATABASE FIX FOR EVENT PERSISTENCE ISSUES
-- This script fixes all the database issues causing "undefined" values

-- 1. Fix Fux After Party event
UPDATE events 
SET 
    min_age = 18,
    dress_code = 'Studio 54'
WHERE id = '778b1766-4842-48c4-a423-74b9faa27891';

-- 2. Fix AFTERSTATE x OPIUM event
UPDATE events 
SET 
    min_age = 18,
    dress_code = 'Smart Casual'
WHERE id = 'bb9ad0bb-f38e-4722-bea6-39faedd0d3b9';

-- 3. Fix any other events with default values
UPDATE events 
SET dress_code = 'Casual'
WHERE dress_code = 'No specific dress code';

-- 4. Verify the updates
SELECT 
    id, 
    title, 
    min_age, 
    dress_code,
    date,
    status
FROM events 
WHERE id IN (
    '778b1766-4842-48c4-a423-74b9faa27891',
    'bb9ad0bb-f38e-4722-bea6-39faedd0d3b9'
);

-- 5. Check all events for any remaining issues
SELECT 
    id, 
    title, 
    min_age, 
    dress_code,
    CASE 
        WHEN dress_code = 'No specific dress code' THEN 'NEEDS FIX'
        WHEN dress_code IS NULL THEN 'NEEDS FIX'
        ELSE 'OK'
    END as dress_code_status
FROM events 
ORDER BY created_at DESC;
