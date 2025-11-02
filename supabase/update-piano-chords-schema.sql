-- Update piano_chords table to support inversions
-- This script safely updates the table even if it doesn't exist yet

-- Ensure the piano_chords table exists with all required columns
CREATE TABLE IF NOT EXISTS public.piano_chords (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chord_name TEXT NOT NULL,
  key_signature TEXT NOT NULL,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  notes TEXT[] NOT NULL,
  finger_positions JSONB,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Remove UNIQUE constraint on chord_name if it exists (to allow multiple inversions)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'piano_chords_chord_name_key'
    AND conrelid = 'public.piano_chords'::regclass
  ) THEN
    ALTER TABLE public.piano_chords DROP CONSTRAINT piano_chords_chord_name_key;
  END IF;
END $$;

-- Add inversion column if it doesn't exist
ALTER TABLE public.piano_chords 
  ADD COLUMN IF NOT EXISTS inversion INTEGER DEFAULT 0;

-- Add root_name column to track the base chord name (without inversion)
ALTER TABLE public.piano_chords 
  ADD COLUMN IF NOT EXISTS root_name TEXT;

-- Create indexes (only if columns exist)
CREATE INDEX IF NOT EXISTS idx_piano_chords_root_name ON public.piano_chords(root_name);
CREATE INDEX IF NOT EXISTS idx_piano_chords_chord_name ON public.piano_chords(chord_name);
CREATE INDEX IF NOT EXISTS idx_piano_chords_key_signature ON public.piano_chords(key_signature);

-- Create composite index for chord lookups (only if key_signature exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'piano_chords' 
    AND column_name = 'key_signature'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_piano_chords_name_key ON public.piano_chords(chord_name, key_signature);
  END IF;
END $$;

-- Add comments
COMMENT ON COLUMN public.piano_chords.inversion IS 'Inversion number: 0 = root position, 1 = first inversion, 2 = second inversion, 3 = third inversion';
COMMENT ON COLUMN public.piano_chords.root_name IS 'Base chord name without inversion suffix';

