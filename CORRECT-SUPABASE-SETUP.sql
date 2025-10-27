-- =====================================================
-- CORRECT SUPABASE SETUP - AFTERSTATE EVENTS
-- =====================================================
-- This uses the VERIFIED WORKING password hash for "admin123"
-- Hash tested and confirmed: $2b$10$GgP51trRlA/e52x9EA9ZnOXEnBrCWQk7LiIXBdAyA9yP68ZogqW3u
-- =====================================================

-- Step 1: Clean up any existing admin accounts
DELETE FROM admin WHERE email IN ('admin@studentevents.com', 'admin@afterstate.events');

-- Step 2: Create admin with CORRECT working hash
-- Email: admin@afterstate.events  
-- Password: admin123
INSERT INTO admin (email, password_hash, full_name) 
VALUES ('admin@afterstate.events', '$2b$10$GgP51trRlA/e52x9EA9ZnOXEnBrCWQk7LiIXBdAyA9yP68ZogqW3u', 'System Administrator');

-- Step 3: Update bank transfer information
UPDATE settings 
SET value = 'Paulius Kulikas & Ignas Lapas' 
WHERE key = 'bank_recipient_name' AND category = 'payment';

UPDATE settings 
SET value = 'LT29 3250 0447 1147 0838' 
WHERE key = 'bank_iban' AND category = 'payment';

-- Step 4: Verify everything worked
SELECT 
  '✅ ADMIN CREATED' as status, 
  email, 
  full_name,
  substring(password_hash, 1, 29) as hash_preview,
  created_at 
FROM admin 
WHERE email = 'admin@afterstate.events';

SELECT 
  '✅ BANK SETTINGS' as status, 
  key, 
  value 
FROM settings 
WHERE key IN ('bank_recipient_name', 'bank_iban')
ORDER BY key;

-- =====================================================
-- EXPECTED RESULTS:
-- =====================================================
-- Admin hash_preview should show: $2b$10$GgP51trRlA/e52x9EA9Zn
-- Bank recipient: Paulius Kulikas & Ignas Lapas
-- Bank IBAN: LT29 3250 0447 1147 0838
-- =====================================================
-- AFTER RUNNING THIS:
-- Go to: https://afterstateevents.vercel.app/admin/login.html
-- Email: admin@afterstate.events
-- Password: admin123
-- =====================================================

