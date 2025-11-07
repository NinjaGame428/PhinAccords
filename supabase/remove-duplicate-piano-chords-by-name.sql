-- Remove duplicate piano chords based on exact chord_name matches
-- This script identifies and removes duplicate entries where the same chord_name appears multiple times

-- First, check for duplicates by chord_name
SELECT 
  chord_name,
  COUNT(*) as count,
  STRING_AGG(id::text, ', ') as ids
FROM public.piano_chords
GROUP BY chord_name
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Delete duplicates, keeping only the first occurrence (by id)
-- This will remove any exact duplicate chord_name entries
DELETE FROM public.piano_chords
WHERE id IN (
  SELECT id
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY chord_name
        ORDER BY 
          inversion ASC,  -- Prioritize root position
          id ASC          -- Then by ID for consistency
      ) as row_num
    FROM public.piano_chords
  ) ranked
  WHERE row_num > 1  -- Delete all but the first occurrence
);

-- Verify no duplicates remain
SELECT 
  chord_name,
  COUNT(*) as count
FROM public.piano_chords
GROUP BY chord_name
HAVING COUNT(*) > 1;

-- Also check for duplicates by root_name + inversion (more comprehensive)
SELECT 
  COALESCE(root_name, chord_name) as root_name,
  COALESCE(inversion, 0) as inversion,
  COUNT(*) as count
FROM public.piano_chords
GROUP BY COALESCE(root_name, chord_name), COALESCE(inversion, 0)
HAVING COUNT(*) > 1
ORDER BY count DESC;

