-- =====================================================
-- FIX CONTACT SETTINGS - Direct Database Update
-- =====================================================
-- This will update the contact information to show correctly
-- on the contacts page using your saved values
-- =====================================================

-- Step 1: Delete any old incorrectly-keyed settings
DELETE FROM settings WHERE key IN (
  'supportEmail', 'supportPhone', 'workingHours',
  'orgName', 'orgEmail', 'orgPhone'
);

-- Step 2: Update or insert correct contact settings with your values
INSERT INTO settings (key, value, category) VALUES
  ('support_email', 'afterstate.events@gmail.com', 'contact'),
  ('support_phone', '+37063849474', 'contact'),
  ('support_hours', 'Mon - Sun 10:00 - 20:00', 'contact')
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value, 
    category = EXCLUDED.category,
    updated_at = NOW();

-- Step 3: Update or insert organization settings with your values
INSERT INTO settings (key, value, category) VALUES
  ('organization_name', 'Afterstate Events', 'organization'),
  ('organization_email', 'afterstate.events@gmail.com', 'organization'),
  ('organization_phone', '+37063849474', 'organization')
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Step 4: Verify the changes
SELECT 
  '✅ CONTACT SETTINGS UPDATED' as status,
  key,
  value,
  category
FROM settings 
WHERE category IN ('contact', 'organization')
ORDER BY category, key;

-- =====================================================
-- EXPECTED RESULTS:
-- =====================================================
-- You should see:
-- contact  | support_email | afterstate.events@gmail.com
-- contact  | support_hours | Mon - Sun 10:00 - 20:00
-- contact  | support_phone | +37063849474
-- organization | organization_email | afterstate.events@gmail.com
-- organization | organization_name  | Afterstate Events
-- organization | organization_phone | +37063849474
-- =====================================================
-- AFTER RUNNING THIS:
-- 1. Go to: https://afterstateevents.vercel.app/contacts.html
-- 2. Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
-- 3. ✅ Should show correct contact information!
-- =====================================================

