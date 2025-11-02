-- Update piano_chords table to support inversions
-- Remove UNIQUE constraint on chord_name to allow multiple inversions
-- Add inversion column for better querying

-- First, drop the unique constraint if it exists
ALTER TABLE IF EXISTS public.piano_chords 
  DROP CONSTRAINT IF EXISTS piano_chords_chord_name_key;

-- Add inversion column if it doesn't exist
ALTER TABLE IF EXISTS public.piano_chords 
  ADD COLUMN IF NOT EXISTS inversion INTEGER DEFAULT 0;

-- Add root_name column to track the base chord name (without inversion)
ALTER TABLE IF EXISTS public.piano_chords 
  ADD COLUMN IF NOT EXISTS root_name TEXT;

-- Create index on root_name for faster lookups
CREATE INDEX IF NOT EXISTS idx_piano_chords_root_name ON public.piano_chords(root_name);

-- Create composite index for chord lookups
CREATE INDEX IF NOT EXISTS idx_piano_chords_name_key ON public.piano_chords(chord_name, key_signature);

-- Add comment
COMMENT ON COLUMN public.piano_chords.inversion IS 'Inversion number: 0 = root position, 1 = first inversion, 2 = second inversion, 3 = third inversion';
COMMENT ON COLUMN public.piano_chords.root_name IS 'Base chord name without inversion suffix';

