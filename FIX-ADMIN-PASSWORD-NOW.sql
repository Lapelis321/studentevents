-- =====================================================
-- FIX ADMIN PASSWORD - RUN THIS IN SUPABASE NOW!
-- =====================================================
-- This will set the admin password to: admin123
-- Email: admin@afterstate.events
-- =====================================================

UPDATE admin 
SET password_hash = '$2b$10$GgP51trRlA/e52x9EA9ZnOXEnBrCWQk7LiIXBdAyA9yP68ZogqW3u' 
WHERE email = 'admin@afterstate.events';

-- Verify the fix
SELECT 
  '✅ PASSWORD FIXED!' as status, 
  email, 
  full_name,
  'admin123' as password,
  substring(password_hash, 1, 20) || '...' as hash_preview
FROM admin 
WHERE email = 'admin@afterstate.events';

-- =====================================================
-- AFTER RUNNING THIS:
-- Go to: https://afterstateevents.vercel.app/admin/login.html
-- Email: admin@afterstate.events
-- Password: admin123
-- =====================================================

