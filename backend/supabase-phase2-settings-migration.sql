-- Phase 2 Migration: Enhanced Settings System
-- Add support phone and working hours, clean up old settings

-- Update settings table with new fields (if they don't exist)
INSERT INTO settings (key, value, category, label, description) 
VALUES 
  ('support_phone', '+370 600 00000', 'contact', 'Support Phone Number', 'Phone number for customer support')
ON CONFLICT (key) DO NOTHING;

INSERT INTO settings (key, value, category, label, description) 
VALUES 
  ('support_hours', 'Mon-Fri 9:00-17:00', 'contact', 'Support Working Hours', 'When customer support is available')
ON CONFLICT (key) DO NOTHING;

INSERT INTO settings (key, value, category, label, description) 
VALUES 
  ('org_name', 'StudentEvents', 'organization', 'Organization Name', 'Name of the organization')
ON CONFLICT (key) DO NOTHING;

INSERT INTO settings (key, value, category, label, description) 
VALUES 
  ('org_logo_url', '', 'organization', 'Organization Logo URL', 'URL to organization logo image')
ON CONFLICT (key) DO NOTHING;

INSERT INTO settings (key, value, category, label, description) 
VALUES 
  ('org_primary_color', '#0055de', 'organization', 'Primary Brand Color', 'Hex color code for branding')
ON CONFLICT (key) DO NOTHING;

-- Remove deprecated settings (optional - commented out for safety)
-- DELETE FROM settings WHERE key IN ('base_ticket_price', 'ism_student_discount', 'payment_deadline_hours');

-- Add comment for clarification
COMMENT ON TABLE settings IS 'System-wide settings for organization, contact info, and configuration';

