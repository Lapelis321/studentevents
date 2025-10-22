-- =====================================================
-- SIMPLE SEED DATA - FOR SUPABASE
-- =====================================================

-- Insert admin account
INSERT INTO admin (email, password_hash, full_name) 
VALUES ('admin@studentevents.com', '$2a$10$8K1p/a0dL3LclLe7FP8yCu8kDECxzKzLd1Hm0P7EcKFJq.0F3Z0KO', 'System Administrator');

-- Insert settings
INSERT INTO settings (key, value, category) VALUES
('payment_method', 'bank-transfer', 'payment'),
('support_email', 'support@studentevents.com', 'contact'),
('support_phone', '+370 600 00000', 'contact'),
('organization_name', 'StudentEvents', 'organization');

-- Insert policies (simplified content)
INSERT INTO policies (type, title, content, is_published) VALUES
('terms', 'Terms of Service', 'Terms of Service content', true),
('privacy', 'Privacy Policy', 'Privacy Policy content', true),
('guidelines', 'Event Guidelines', 'Event Guidelines content', true),
('refund', 'Refund Policy', 'Refund Policy content', true),
('conduct', 'Code of Conduct', 'Code of Conduct content', true);

-- Verify inserts
SELECT 'Admin count: ' || COUNT(*) FROM admin;
SELECT 'Settings count: ' || COUNT(*) FROM settings;
SELECT 'Policies count: ' || COUNT(*) FROM policies;

