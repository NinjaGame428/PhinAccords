-- Ensure password_hash column exists in users table
-- Run this in Neon SQL Editor if users table doesn't have password_hash

DO $$ 
BEGIN
  -- Add password_hash column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE users ADD COLUMN password_hash TEXT;
    RAISE NOTICE 'Added password_hash column to users table';
  ELSE
    RAISE NOTICE 'password_hash column already exists';
  END IF;
  
  -- Ensure UUID extension is enabled
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  
  -- Ensure gen_random_uuid() function exists (modern PostgreSQL has it built-in)
  -- If not available, we'll use uuid_generate_v4() from uuid-ossp
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";
END $$;

-- Verify the column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users' 
AND column_name = 'password_hash';

