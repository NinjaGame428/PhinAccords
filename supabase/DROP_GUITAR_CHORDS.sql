-- Drop Guitar Chords Table and Related Objects
-- Run this script to completely remove guitar_chords from your database

-- Drop trigger first (if exists)
DROP TRIGGER IF EXISTS update_guitar_chords_updated_at ON public.guitar_chords;

-- Drop RLS policies
DROP POLICY IF EXISTS "Anyone can view guitar chords" ON public.guitar_chords;
DROP POLICY IF EXISTS "Admins can manage guitar chords" ON public.guitar_chords;

-- Drop indexes (if they exist)
DROP INDEX IF EXISTS idx_guitar_chords_key_signature;
DROP INDEX IF EXISTS idx_guitar_chords_difficulty;

-- Drop the table
DROP TABLE IF EXISTS public.guitar_chords CASCADE;

-- Verification query (uncomment to verify)
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name = 'guitar_chords';

