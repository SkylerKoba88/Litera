-- Add interests column to users table (stored as JSON array)
ALTER TABLE users ADD COLUMN interests TEXT DEFAULT NULL;
