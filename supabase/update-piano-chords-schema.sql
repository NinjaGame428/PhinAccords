-- Update piano_chords table to support inversions
-- This script safely updates the table even if it doesn't exist yet

-- Ensure the piano_chords table exists
CREATE TABLE IF NOT EXISTS public.piano_chords (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chord_name TEXT NOT NULL,
  difficulty TEXT DEFAULT 'medium',
  notes TEXT[] NOT NULL,
  finger_positions JSONB,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add key_signature column if it doesn't exist
ALTER TABLE public.piano_chords 
  ADD COLUMN IF NOT EXISTS key_signature TEXT;

-- Update key_signature to NOT NULL if it's currently nullable
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'piano_chords' 
    AND column_name = 'key_signature'
    AND is_nullable = 'YES'
  ) THEN
    -- Set a default value for existing NULL rows
    UPDATE public.piano_chords SET key_signature = 'C' WHERE key_signature IS NULL;
    -- Then alter to NOT NULL
    ALTER TABLE public.piano_chords ALTER COLUMN key_signature SET NOT NULL;
  END IF;
END $$;

-- Add difficulty constraint if table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'piano_chords'
  ) THEN
    -- Add check constraint if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'piano_chords_difficulty_check'
    ) THEN
      ALTER TABLE public.piano_chords 
        ADD CONSTRAINT piano_chords_difficulty_check 
        CHECK (difficulty IN ('easy', 'medium', 'hard'));
    END IF;
  END IF;
END $$;

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

-- Add finger_positions column if it doesn't exist
ALTER TABLE public.piano_chords 
  ADD COLUMN IF NOT EXISTS finger_positions JSONB;

-- Ensure finger_positions exists even if table was created differently
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'piano_chords' 
    AND column_name = 'finger_positions'
  ) THEN
    ALTER TABLE public.piano_chords ADD COLUMN finger_positions JSONB;
  END IF;
END $$;

-- Add diagram_svg column for storing rendered SVG diagrams
ALTER TABLE public.piano_chords 
  ADD COLUMN IF NOT EXISTS diagram_svg TEXT;

-- Add diagram_data column for storing diagram configuration (JSONB)
ALTER TABLE public.piano_chords 
  ADD COLUMN IF NOT EXISTS diagram_data JSONB;

-- Add chord_type column if it doesn't exist (nullable to support existing data)
ALTER TABLE public.piano_chords 
  ADD COLUMN IF NOT EXISTS chord_type TEXT;

-- Make chord_type nullable if it exists as NOT NULL
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'piano_chords' 
    AND column_name = 'chord_type'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.piano_chords ALTER COLUMN chord_type DROP NOT NULL;
  END IF;
END $$;

-- Add root_note column if it doesn't exist (nullable to support existing data)
ALTER TABLE public.piano_chords 
  ADD COLUMN IF NOT EXISTS root_note TEXT;

-- Make root_note nullable if it exists as NOT NULL
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'piano_chords' 
    AND column_name = 'root_note'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.piano_chords ALTER COLUMN root_note DROP NOT NULL;
  END IF;
END $$;

-- Add intervals column if it doesn't exist (nullable to support existing data)
ALTER TABLE public.piano_chords 
  ADD COLUMN IF NOT EXISTS intervals INTEGER[];

-- Make intervals nullable if it exists as NOT NULL
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'piano_chords' 
    AND column_name = 'intervals'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.piano_chords ALTER COLUMN intervals DROP NOT NULL;
  END IF;
END $$;

-- Create indexes safely (check if columns exist first)
DO $$
BEGIN
  -- Index on root_name
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'piano_chords' 
    AND column_name = 'root_name'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_piano_chords_root_name ON public.piano_chords(root_name);
  END IF;

  -- Index on chord_name
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'piano_chords' 
    AND column_name = 'chord_name'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_piano_chords_chord_name ON public.piano_chords(chord_name);
  END IF;

  -- Index on key_signature
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'piano_chords' 
    AND column_name = 'key_signature'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_piano_chords_key_signature ON public.piano_chords(key_signature);
  END IF;

  -- Composite index (both columns must exist)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'piano_chords' 
    AND column_name = 'chord_name'
  ) AND EXISTS (
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
COMMENT ON COLUMN public.piano_chords.finger_positions IS 'JSONB array of finger positions for each note (e.g., [1,3,5])';
COMMENT ON COLUMN public.piano_chords.diagram_svg IS 'Pre-rendered SVG diagram of the piano chord (cached for performance)';
COMMENT ON COLUMN public.piano_chords.diagram_data IS 'JSONB configuration data for rendering the chord diagram (notes positions, key highlights, etc.)';

