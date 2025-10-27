-- Clear all existing policy data to fix field mapping issues
-- This will allow the policy system to work correctly with fresh data

-- Delete all existing policy settings
DELETE FROM settings WHERE key LIKE 'policy_%';

-- Verify the cleanup
SELECT COUNT(*) as remaining_policy_settings FROM settings WHERE key LIKE 'policy_%';

-- The policy system will now work with empty fields, allowing correct content to be saved
