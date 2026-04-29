-- Add avatar_url column to users table
ALTER TABLE litera.users ADD COLUMN avatar_url VARCHAR(1024) DEFAULT NULL;
