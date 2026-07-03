-- Drops everything in the public schema. Used by `npm run db:wipe` before
-- re-applying schema.sql. Destructive: all data is lost.
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO public;
