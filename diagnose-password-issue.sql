-- =====================================================
-- DIAGNOSTIC: Check what's actually in the database
-- =====================================================

-- 1. Check all admin accounts
SELECT 
  'CURRENT ADMIN ACCOUNTS' as diagnostic,
  email, 
  full_name,
  password_hash,
  length(password_hash) as hash_length,
  substring(password_hash, 1, 4) as hash_version,
  created_at
FROM admin
ORDER BY created_at DESC;

-- 2. Check specifically for our admin
SELECT 
  'AFTERSTATE ADMIN DETAILS' as diagnostic,
  id,
  email,
  full_name,
  password_hash,
  substring(password_hash, 1, 29) as hash_start
FROM admin 
WHERE email = 'admin@afterstate.events';

-- =====================================================
-- Expected Results:
-- =====================================================
-- If password was updated correctly:
--   hash_start should be: $2b$10$GgP51trRlA/e52x9EA9Zn
--
-- If password was NOT updated:
--   hash_start will be: $2a$10$8K1p/a0dL3LclLe7FP8yC
-- =====================================================

