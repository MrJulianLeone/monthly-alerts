-- Reset alerts table by deleting all alert records
-- This migration will erase all alerts from the database

DELETE FROM alerts;

-- Reset the sequence (optional - keeps IDs clean)
-- Note: PostgreSQL uses gen_random_uuid() so no sequence to reset

