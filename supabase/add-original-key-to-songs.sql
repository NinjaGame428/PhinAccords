-- Add original_key column to songs table to store the original key signature
-- This allows transposing from any key to any key while preserving the original

-- Add original_key column if it doesn't exist
ALTER TABLE public.songs 
  ADD COLUMN IF NOT EXISTS original_key TEXT;

-- For existing songs, set original_key to current key_signature if original_key is NULL
UPDATE public.songs
SET original_key = key_signature
WHERE original_key IS NULL AND key_signature IS NOT NULL;

-- Add comment
COMMENT ON COLUMN public.songs.original_key IS 'Original key signature when song was first created. key_signature can change when transposed, but original_key remains constant.';

