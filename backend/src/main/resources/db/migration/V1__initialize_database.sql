-- Establish the migration baseline without committing to unreviewed business tables.
-- PostgreSQL provides the public schema; Flyway creates its own history table.
SELECT 1;
