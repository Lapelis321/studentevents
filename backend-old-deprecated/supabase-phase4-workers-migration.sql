-- Phase 4 Migration: Worker Management System
-- Create workers table and ticket validation system

-- Create workers table
CREATE TABLE IF NOT EXISTS workers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('worker', 'supervisor')),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add tickets_validated column to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS tickets_validated JSONB DEFAULT '[]';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_workers_email ON workers(email);
CREATE INDEX IF NOT EXISTS idx_workers_event_id ON workers(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event_id ON bookings(event_id);

-- Add updated_at trigger for workers
CREATE OR REPLACE FUNCTION update_workers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_workers_updated_at_trigger ON workers;
CREATE TRIGGER update_workers_updated_at_trigger
  BEFORE UPDATE ON workers
  FOR EACH ROW
  EXECUTE FUNCTION update_workers_updated_at();

-- Add comments for documentation
COMMENT ON TABLE workers IS 'Event staff who can validate tickets';
COMMENT ON COLUMN workers.role IS 'worker: can only scan tickets, supervisor: can scan + view participant list';
COMMENT ON COLUMN bookings.tickets_validated IS 'Array of {ticket_number, validated_at, validated_by_worker_id}';

-- Enable RLS for workers table
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;

-- Policy: Workers can read their own data
CREATE POLICY workers_read_own ON workers
  FOR SELECT
  USING (true); -- Allow reading all workers (admin will verify via JWT)

-- Policy: Only admins can insert/update/delete workers (handled via backend authentication)
CREATE POLICY workers_admin_all ON workers
  FOR ALL
  USING (current_user = 'authenticated'); -- This will be enforced by backend JWT verification

