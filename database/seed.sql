-- =====================================================
-- EVENT MANAGEMENT SYSTEM - SEED DATA
-- =====================================================
-- Version: 1.0.0
-- Description: Initial data for fresh system setup
-- =====================================================

-- =====================================================
-- ADMIN ACCOUNT
-- =====================================================
-- Default admin credentials:
-- Email: admin@afterstate.events
-- Password: admin123
-- Password hash generated with bcrypt (10 rounds)

INSERT INTO admin (email, password_hash, full_name) VALUES
('admin@afterstate.events', '$2b$10$GgP51trRlA/e52x9EA9ZnOXEnBrCWQk7LiIXBdAyA9yP68ZogqW3u', 'System Administrator');

-- =====================================================
-- SYSTEM SETTINGS
-- =====================================================

-- Payment Settings
INSERT INTO settings (key, value, category) VALUES
('payment_method', 'bank-transfer', 'payment'),
('stripe_enabled', 'false', 'payment'),
('bank_transfer_enabled', 'true', 'payment');

-- Bank Transfer Settings
INSERT INTO settings (key, value, category) VALUES
('bank_recipient_name', 'Paulius Kulikas', 'payment'),
('bank_iban', 'LT29 3250 0447 1147 0838', 'payment'),
('bank_transfer_deadline_hours', '24', 'payment');

-- Contact Settings
INSERT INTO settings (key, value, category) VALUES
('support_email', 'support@studentevents.com', 'contact'),
('support_phone', '+370 600 00000', 'contact'),
('support_hours', 'Monday - Friday: 9:00 - 18:00', 'contact');

-- Organization Settings
INSERT INTO settings (key, value, category) VALUES
('organization_name', 'Afterstate Events', 'organization'),
('organization_email', 'info@studentevents.com', 'organization'),
('organization_phone', '+370 600 00000', 'organization'),
('organization_address', 'Vilnius, Lithuania', 'organization');

-- System Settings
INSERT INTO settings (key, value, category) VALUES
('system_currency', 'EUR', 'system'),
('system_timezone', 'Europe/Vilnius', 'system'),
('system_language', 'en', 'system'),
('ticket_number_prefix', 'TICKET', 'system'),
('max_tickets_per_booking', '10', 'system');

-- =====================================================
-- POLICY CONTENT
-- =====================================================

-- Terms of Service
INSERT INTO policies (type, title, content, is_published) VALUES
('terms', 'Terms of Service', 
'# Terms of Service

## 1. Acceptance of Terms
By accessing and using Afterstate Events platform, you accept and agree to be bound by the terms and provision of this agreement.

## 2. Use License
Permission is granted to temporarily access the materials on Afterstate Events website for personal, non-commercial transitory viewing only.

## 3. Ticket Purchases
- All ticket sales are final unless the event is cancelled
- Tickets are non-transferable without prior approval
- Valid ID may be required for entry
- Ticket prices are subject to change

## 4. Event Entry
- A valid ticket is required for event entry
- Entry may be refused if ticket is invalid or has been used
- Age restrictions apply to certain events
- Dress code requirements must be followed

## 5. User Conduct
Users agree not to:
- Resell tickets at inflated prices
- Share or duplicate tickets
- Disrupt events or cause disturbances
- Violate any applicable laws

## 6. Liability
Afterstate Events is not responsible for:
- Lost or stolen tickets
- Changes to event schedule
- Personal injury or property damage at events
- Third-party actions

## 7. Contact
For questions about these terms, please contact: support@studentevents.com

Last updated: ' || CURRENT_DATE,
true);

-- Privacy Policy
INSERT INTO policies (type, title, content, is_published) VALUES
('privacy', 'Privacy Policy',
'# Privacy Policy

## 1. Information We Collect
We collect information you provide directly:
- Name and contact details
- Email address and phone number
- Payment information
- Event preferences

## 2. How We Use Your Information
Your information is used to:
- Process ticket purchases
- Send booking confirmations
- Communicate about events
- Improve our services
- Comply with legal obligations

## 3. Information Sharing
We do not sell your personal information. We may share data with:
- Payment processors (Stripe)
- Email service providers
- Event organizers (limited data)

## 4. Data Security
We implement security measures to protect your information:
- Encrypted connections (HTTPS)
- Secure payment processing
- Access controls
- Regular security audits

## 5. Your Rights
You have the right to:
- Access your personal data
- Request data correction
- Request data deletion
- Opt-out of marketing emails

## 6. Cookies
We use cookies to:
- Maintain login sessions
- Remember preferences
- Analyze site usage

## 7. Contact Us
For privacy concerns, contact: support@studentevents.com

Last updated: ' || CURRENT_DATE,
true);

-- Event Guidelines
INSERT INTO policies (type, title, content, is_published) VALUES
('guidelines', 'Event Guidelines',
'# Event Guidelines

## Before the Event

### Purchase Tickets
- Buy tickets through our official website only
- Keep your ticket confirmation email
- Download your ticket PDF

### Entry Requirements
- Valid ticket (digital or printed)
- Government-issued ID (if age restricted)
- Follow dress code requirements

## During the Event

### Entry Process
- Arrive early to avoid queues
- Have ticket and ID ready
- QR code will be scanned at entry
- Wristband may be provided

### Behavior
- Respect other attendees
- Follow staff instructions
- No alcohol for underage attendees
- No smoking in restricted areas

### Safety
- Know emergency exits
- Report suspicious activity
- Keep valuables secure
- Stay hydrated

## Important Notes
- Entry is at the discretion of event staff
- Zero tolerance for disruptive behavior
- Events may be photographed/recorded
- Schedule is subject to change

For questions: support@studentevents.com',
true);

-- Refund Policy
INSERT INTO policies (type, title, content, is_published) VALUES
('refund', 'Refund Policy',
'# Refund Policy

## General Policy
All ticket sales are final. Refunds are generally not available except in specific circumstances outlined below.

## Event Cancellation
If an event is cancelled by the organizer:
- Full refund issued automatically
- Refund processed within 7-10 business days
- Original payment method will be credited

## Event Rescheduling
If an event is rescheduled:
- Tickets remain valid for new date
- Refund available if you cannot attend new date
- Request refund within 7 days of announcement

## Ticket Transfer
Instead of refunds, consider:
- Transferring ticket to another person
- Contact us for transfer approval
- Transfer fee may apply

## No Refund Situations
Refunds will NOT be issued for:
- Change of mind
- Inability to attend
- Travel issues
- Weather conditions (unless event cancelled)
- Partial attendance

## How to Request Refund
1. Email support@studentevents.com
2. Include booking reference
3. Explain reason for request
4. Allow 5-7 business days for review

## Contact
Questions about refunds: support@studentevents.com

Last updated: ' || CURRENT_DATE,
true);

-- Code of Conduct
INSERT INTO policies (type, title, content, is_published) VALUES
('conduct', 'Code of Conduct',
'# Code of Conduct

## Our Commitment
Afterstate Events is committed to providing a safe, inclusive, and enjoyable experience for all attendees.

## Expected Behavior
All attendees should:
- Treat others with respect and courtesy
- Follow event staff instructions
- Respect venue property and facilities
- Be mindful of noise levels
- Clean up after themselves

## Unacceptable Behavior
The following behaviors will not be tolerated:
- Harassment or intimidation
- Discriminatory language or actions
- Violence or threats
- Property damage
- Illegal activities
- Excessive intoxication
- Disrupting the event

## Consequences
Violations may result in:
- Warning from event staff
- Removal from event without refund
- Ban from future events
- Legal action if applicable

## Reporting
To report violations:
- Contact event staff immediately
- Email: support@studentevents.com
- Emergency: call local authorities

## Age Restrictions
- Minimum age requirements must be followed
- Valid ID required for verification
- Adults responsible for accompanied minors

## Alcohol Policy
- No alcohol for underage attendees
- Responsible consumption expected
- Right to refuse service

## Photography
- Events may be photographed/recorded
- By attending, you consent to being photographed
- Photos may be used for promotional purposes

## Accessibility
- We strive to accommodate all attendees
- Contact us in advance for special needs
- Assistants/caregivers welcome

Thank you for helping create a positive experience for everyone!

Contact: support@studentevents.com

Last updated: ' || CURRENT_DATE,
true);

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Uncomment to add sample events for testing:
/*
INSERT INTO events (name, date, location, description, price, total_tickets, min_age, dress_code, status) VALUES
('Welcome Back Party', NOW() + INTERVAL '7 days', 'Student Union Building', 'Kick off the new semester with music, food, and fun!', 15.00, 200, 18, 'Casual', 'active'),
('Spring Music Festival', NOW() + INTERVAL '30 days', 'Central Park Arena', 'Annual spring music festival featuring local and international artists.', 25.00, 500, 16, 'Festival Casual', 'active'),
('Career Networking Night', NOW() + INTERVAL '14 days', 'Business Center Hall', 'Connect with industry professionals and explore career opportunities.', 0.00, 150, 18, 'Business Casual', 'active');
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Run these to verify data was inserted correctly:
-- SELECT * FROM admin;
-- SELECT * FROM settings ORDER BY category, key;
-- SELECT * FROM policies ORDER BY type;

-- =====================================================
-- END OF SEED DATA
-- =====================================================


