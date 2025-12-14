-- 000004_add_billing_and_service_type.down.sql
-- SQLite doesn't support DROP COLUMN directly, so we need to recreate tables
-- For simplicity, this migration is not fully reversible in SQLite

-- Note: In production, you would need to:
-- 1. Create temp tables without new columns
-- 2. Copy data
-- 3. Drop original tables
-- 4. Rename temp tables

-- This is a placeholder for the down migration
SELECT 1;
