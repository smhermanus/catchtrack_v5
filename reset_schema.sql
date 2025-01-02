-- Create a backup schema
CREATE SCHEMA IF NOT EXISTS backup_schema;

-- Drop existing backup tables if they exist
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'backup_schema') LOOP
        EXECUTE 'DROP TABLE IF EXISTS backup_schema.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END$$;

-- Copy all tables to the backup schema
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'CREATE TABLE backup_schema.' || quote_ident(r.tablename) || ' AS TABLE public.' || quote_ident(r.tablename);
    END LOOP;
END$$;

-- Drop the public schema
DROP SCHEMA public CASCADE;

-- Recreate the public schema
CREATE SCHEMA public;

-- Restore tables from backup
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'backup_schema') LOOP
        EXECUTE 'CREATE TABLE public.' || quote_ident(r.tablename) || ' AS TABLE backup_schema.' || quote_ident(r.tablename);
    END LOOP;
END$$;

-- Optional: You might want to recreate indexes, constraints, and sequences here
-- This is a basic script and might need adjustments based on your specific schema
