-- Fix password_hash to allow NULL for existing users
-- This is safe because we'll always set it for new users
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Verify the change
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users' 
AND column_name = 'password_hash';

