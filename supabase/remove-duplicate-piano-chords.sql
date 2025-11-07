-- Remove duplicate piano chords from the database
-- This script removes duplicates based on root_name + inversion combination
-- Keeps the first occurrence (prioritizing root positions)

-- First, let's see what duplicates exist
WITH duplicates AS (
  SELECT 
    id,
    chord_name,
    root_name,
    inversion,
    ROW_NUMBER() OVER (
      PARTITION BY 
        COALESCE(root_name, chord_name), 
        COALESCE(inversion, 0)
      ORDER BY 
        inversion ASC,  -- Prioritize root position (inversion = 0)
        id ASC         -- Then by ID for consistency
    ) as row_num
  FROM public.piano_chords
)
SELECT 
  COUNT(*) as duplicate_count,
  COUNT(DISTINCT COALESCE(root_name, chord_name) || '_' || COALESCE(inversion::text, '0')) as unique_combinations
FROM duplicates
WHERE row_num > 1;

-- Actually delete duplicates (uncomment to execute)
-- This will keep only the first occurrence of each root_name + inversion combination
/*
DELETE FROM public.piano_chords
WHERE id IN (
  SELECT id
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY 
          COALESCE(root_name, chord_name), 
          COALESCE(inversion, 0)
        ORDER BY 
          inversion ASC,  -- Prioritize root position
          id ASC
      ) as row_num
    FROM public.piano_chords
  ) ranked
  WHERE row_num > 1  -- Delete all but the first occurrence
);
*/

-- After deletion, verify the results
-- This query should return only unique combinations
SELECT 
  COALESCE(root_name, chord_name) as root_name,
  COALESCE(inversion, 0) as inversion,
  COUNT(*) as count
FROM public.piano_chords
GROUP BY COALESCE(root_name, chord_name), COALESCE(inversion, 0)
HAVING COUNT(*) > 1;

-- If the above returns 0 rows, all duplicates have been removed

