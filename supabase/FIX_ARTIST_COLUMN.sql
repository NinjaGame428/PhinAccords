-- Quick fix: Add missing artist column to songs table
-- Run this first if you got the "column artist does not exist" error

-- Add artist column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'songs' 
    AND column_name = 'artist'
  ) THEN
    ALTER TABLE public.songs ADD COLUMN artist TEXT;
    RAISE NOTICE 'Added artist column to songs table';
  ELSE
    RAISE NOTICE 'Artist column already exists';
  END IF;
END $$;

-- Now you can run the full QUICK_DEPLOY.sql script

