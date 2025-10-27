-- =====================================================
-- ADMIN ACCOUNT DIAGNOSTIC AND FIX
-- =====================================================

-- Step 1: Check what admin accounts currently exist
SELECT '=== EXISTING ADMIN ACCOUNTS ===' as status;
SELECT id, email, full_name, created_at FROM admin;

-- Step 2: Check if tables exist
SELECT '=== TABLE CHECK ===' as status;
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin') 
    THEN 'admin table EXISTS' 
    ELSE 'admin table MISSING' 
  END as admin_table,
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'settings') 
    THEN 'settings table EXISTS' 
    ELSE 'settings table MISSING' 
  END as settings_table,
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'events') 
    THEN 'events table EXISTS' 
    ELSE 'events table MISSING' 
  END as events_table;

-- Step 3: Delete old admin accounts and create fresh one
SELECT '=== CLEANING OLD ADMINS ===' as status;
DELETE FROM admin WHERE email IN ('admin@studentevents.com', 'admin@afterstate.events');

-- Step 4: Insert new admin account with correct credentials
SELECT '=== CREATING NEW ADMIN ===' as status;
INSERT INTO admin (email, password_hash, full_name) VALUES
('admin@afterstate.events', '$2a$10$8K1p/a0dL3LclLe7FP8yCu8kDECxzKzLd1Hm0P7EcKFJq.0F3Z0KO', 'System Administrator');

-- Step 5: Verify admin was created
SELECT '=== VERIFICATION ===' as status;
SELECT id, email, full_name, created_at FROM admin;

-- Step 6: Update bank transfer settings
SELECT '=== UPDATING BANK SETTINGS ===' as status;
UPDATE settings 
SET value = 'Paulius Kulikas & Ignas Lapas' 
WHERE key = 'bank_recipient_name' AND category = 'payment';

UPDATE settings 
SET value = 'LT29 3250 0447 1147 0838' 
WHERE key = 'bank_iban' AND category = 'payment';

-- Step 7: Verify settings
SELECT '=== BANK SETTINGS VERIFICATION ===' as status;
SELECT key, value, category 
FROM settings 
WHERE key IN ('bank_recipient_name', 'bank_iban') 
ORDER BY key;

-- Step 8: Final status
SELECT '=== SETUP COMPLETE ===' as status;
SELECT 
  'Admin Email: admin@afterstate.events' as credentials,
  'Password: admin123' as password,
  'Ready to login!' as status;

