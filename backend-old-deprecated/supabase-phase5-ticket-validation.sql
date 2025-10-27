-- Phase 5: Ticket Validation Migration
-- Add tickets_validated column to bookings table for tracking which tickets have been scanned

-- Add tickets_validated column to bookings table
DO $$ BEGIN
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS tickets_validated JSONB DEFAULT '[]';
    -- Array of {ticket_number, validated_at, validated_by_worker_id}
EXCEPTION
    WHEN duplicate_column THEN RAISE NOTICE 'column tickets_validated already exists in bookings.';
END $$;

-- Add index for faster validation queries
CREATE INDEX IF NOT EXISTS idx_bookings_payment_reference ON bookings(payment_reference);

-- Add comment
COMMENT ON COLUMN bookings.tickets_validated IS 'Array of validated tickets: [{ticket_number, validated_at, validated_by_worker_id}]';

-- Example query to check validated tickets:
-- SELECT id, payment_reference, tickets_validated FROM bookings WHERE tickets_validated != '[]';

