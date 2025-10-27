-- Settings Table for Admin-Configurable Values
-- Run this BEFORE the bookings migration

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  label VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'general',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by VARCHAR(255)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);

-- Insert default bank transfer settings
INSERT INTO settings (key, value, label, description, category) VALUES
  ('bank_recipient_name', 'ISM Events Organization', 'Bank Recipient Name', 'The name that appears on bank transfers', 'payment'),
  ('bank_iban', 'LT12 3456 7890 1234 5678', 'Bank IBAN', 'IBAN for receiving payments', 'payment'),
  ('base_ticket_price', '20.00', 'Base Ticket Price (€)', 'Default price per ticket', 'pricing'),
  ('ism_student_discount', '1.00', 'Non-ISM Student Fee (€)', 'Extra charge for non-ISM students (0 means no extra fee)', 'pricing'),
  ('support_email', 'support@studentevents.com', 'Support Email', 'Email for customer support inquiries', 'general'),
  ('payment_deadline_hours', '24', 'Payment Deadline (hours)', 'Hours until booking expires if unpaid', 'payment'),
  ('organization_name', 'StudentEvents', 'Organization Name', 'Your organization name', 'general')
ON CONFLICT (key) DO NOTHING;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_settings_updated_at();

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view settings" ON settings
    FOR SELECT
    USING (true);

CREATE POLICY "Only admins can update settings" ON settings
    FOR UPDATE
    USING (false); -- Only through API with admin auth

-- Comment
COMMENT ON TABLE settings IS 'Configurable application settings managed through admin dashboard';

