-- =====================================================
-- UPDATE BANK TRANSFER INFORMATION
-- =====================================================
-- Run this script in Supabase SQL Editor to update
-- the bank transfer recipient information
-- =====================================================

-- Update Bank Recipient Name
UPDATE settings 
SET value = 'Paulius Kulikas' 
WHERE key = 'bank_recipient_name' AND category = 'payment';

-- Update Bank IBAN
UPDATE settings 
SET value = 'LT29 3250 0447 1147 0838' 
WHERE key = 'bank_iban' AND category = 'payment';

-- Verify the changes
SELECT key, value, category 
FROM settings 
WHERE key IN ('bank_recipient_name', 'bank_iban') 
ORDER BY key;

-- =====================================================
-- Expected Result:
-- bank_iban             | LT29 3250 0447 1147 0838 | payment
-- bank_recipient_name   | Paulius Kulikas          | payment
-- =====================================================


