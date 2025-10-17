-- Add additional_attendees column to bookings table
-- This column will store JSON data of additional attendees for multi-person bookings

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS additional_attendees TEXT DEFAULT '[]';

-- Update existing bookings to have empty array for additional_attendees
UPDATE bookings 
SET additional_attendees = '[]' 
WHERE additional_attendees IS NULL;

-- Add comment to the column
COMMENT ON COLUMN bookings.additional_attendees IS 'JSON array of additional attendees for multi-person bookings';
