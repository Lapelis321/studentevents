-- Safe Settings Table Fix - Only add what's missing
-- Run this if you got the "policy already exists" error

-- First, drop the existing policy if it exists (to recreate it safely)
DROP POLICY IF EXISTS "Anyone can view settings" ON settings;

-- Recreate the policy
CREATE POLICY "Anyone can view settings"
ON settings
FOR SELECT
USING (true);

-- Ensure all default settings exist (using ON CONFLICT to skip existing ones)
INSERT INTO settings (key, value, label, description, category, updated_by) VALUES
('bank_recipient_name', 'ISM Events Organization', 'Bank Recipient Name', 'The name that appears on bank transfers', 'payment', 'system')
ON CONFLICT (key) DO NOTHING;

INSERT INTO settings (key, value, label, description, category, updated_by) VALUES
('bank_iban', 'LT12 3456 7890 1234 5678', 'Bank IBAN', 'IBAN for receiving payments', 'payment', 'system')
ON CONFLICT (key) DO NOTHING;

INSERT INTO settings (key, value, label, description, category, updated_by) VALUES
('base_ticket_price', '20.00', 'Base Ticket Price (€)', 'Default price per ticket', 'pricing', 'system')
ON CONFLICT (key) DO NOTHING;

INSERT INTO settings (key, value, label, description, category, updated_by) VALUES
('ism_student_discount', '1.00', 'Non-ISM Student Fee (€)', 'Extra charge for non-ISM students (0 means no extra fee)', 'pricing', 'system')
ON CONFLICT (key) DO NOTHING;

INSERT INTO settings (key, value, label, description, category, updated_by) VALUES
('support_email', 'support@studentevents.com', 'Support Email', 'Email for customer support inquiries', 'general', 'system')
ON CONFLICT (key) DO NOTHING;

INSERT INTO settings (key, value, label, description, category, updated_by) VALUES
('payment_deadline_hours', '24', 'Payment Deadline (hours)', 'Hours until booking expires if unpaid', 'payment', 'system')
ON CONFLICT (key) DO NOTHING;

INSERT INTO settings (key, value, label, description, category, updated_by) VALUES
('organization_name', 'StudentEvents', 'Organization Name', 'Your organization name', 'general', 'system')
ON CONFLICT (key) DO NOTHING;

-- Verify settings were created
SELECT * FROM settings ORDER BY category, key;

