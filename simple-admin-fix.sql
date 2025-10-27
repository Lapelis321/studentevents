-- =====================================================
-- SIMPLE ADMIN FIX - Safe approach
-- =====================================================
-- This script safely creates/updates admin account
-- without dropping anything
-- =====================================================

-- Delete any existing admin accounts (clean slate)
DELETE FROM admin WHERE email = 'admin@studentevents.com';
DELETE FROM admin WHERE email = 'admin@afterstate.events';

-- Create the correct admin account
-- Email: admin@afterstate.events  
-- Password: admin123
INSERT INTO admin (email, password_hash, full_name) 
VALUES ('admin@afterstate.events', '$2a$10$8K1p/a0dL3LclLe7FP8yCu8kDECxzKzLd1Hm0P7EcKFJq.0F3Z0KO', 'System Administrator');

-- Update bank info
UPDATE settings SET value = 'Paulius Kulikas & Ignas Lapas' WHERE key = 'bank_recipient_name';
UPDATE settings SET value = 'LT29 3250 0447 1147 0838' WHERE key = 'bank_iban';

-- Show results
SELECT '✅ ADMIN CREATED' as status, email, full_name FROM admin;
SELECT '✅ BANK SETTINGS' as status, key, value FROM settings WHERE key IN ('bank_recipient_name', 'bank_iban');

