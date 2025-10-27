-- Check if bookings table exists
SELECT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'bookings'
) AS bookings_table_exists;

-- If it returns TRUE, the table exists and you can skip the migration
-- If it returns FALSE, you need to run supabase-bank-transfer-migration.sql

