-- ============================================================================
-- Script to fix songs with null artist_id in the database
-- ============================================================================
-- This script will:
-- 1. Find songs with null artist_id but have an artist name
-- 2. Try to match them with existing artists by name (case-insensitive)
-- 3. Create missing artists if they don't exist
-- 4. Update songs with the correct artist_id
-- 5. Sync artist text field with artist_id
-- ============================================================================

-- Step 1: Create a function to get or create artist by name
-- This function will be kept for future use
CREATE OR REPLACE FUNCTION get_or_create_artist(artist_name TEXT)
RETURNS UUID AS $$
DECLARE
  artist_uuid UUID;
  clean_name TEXT;
BEGIN
  -- Clean and trim the artist name
  clean_name := TRIM(artist_name);
  
  -- Skip if name is empty
  IF clean_name = '' OR clean_name IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Try to find existing artist by name (case-insensitive, trimmed)
  SELECT id INTO artist_uuid
  FROM artists
  WHERE LOWER(TRIM(name)) = LOWER(clean_name)
  LIMIT 1;
  
  -- If artist doesn't exist, create it
  IF artist_uuid IS NULL THEN
    INSERT INTO artists (name, created_at, updated_at)
    VALUES (clean_name, NOW(), NOW())
    RETURNING id INTO artist_uuid;
    
    RAISE NOTICE 'Created new artist: % (ID: %)', clean_name, artist_uuid;
  END IF;
  
  RETURN artist_uuid;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Show current status before fixing
DO $$
DECLARE
  null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_count
  FROM songs
  WHERE artist_id IS NULL 
    AND artist IS NOT NULL 
    AND TRIM(artist) != '';
  
  RAISE NOTICE 'Found % songs with null artist_id but have artist name', null_count;
END $$;

-- Step 3: Update songs with null artist_id but have artist name
UPDATE songs
SET 
  artist_id = get_or_create_artist(artist),
  updated_at = NOW()
WHERE artist_id IS NULL 
  AND artist IS NOT NULL 
  AND TRIM(artist) != '';

-- Step 4: Also update artist text field for songs that have artist_id but null/empty artist text
UPDATE songs
SET 
  artist = (
    SELECT name 
    FROM artists 
    WHERE artists.id = songs.artist_id
    LIMIT 1
  ),
  updated_at = NOW()
WHERE artist_id IS NOT NULL 
  AND (artist IS NULL OR TRIM(artist) = '');

-- Step 5: Verification - Show remaining songs with null artist_id (should be empty or only songs with no artist name)
SELECT 
  id,
  title,
  artist,
  artist_id,
  created_at,
  updated_at
FROM songs
WHERE artist_id IS NULL
ORDER BY created_at DESC;

-- Step 6: Show summary of what was fixed
DO $$
DECLARE
  fixed_count INTEGER;
  remaining_count INTEGER;
BEGIN
  -- Count songs that were fixed (now have artist_id)
  SELECT COUNT(*) INTO fixed_count
  FROM songs
  WHERE artist_id IS NOT NULL
    AND updated_at >= NOW() - INTERVAL '1 minute';
  
  -- Count remaining null artist_ids
  SELECT COUNT(*) INTO remaining_count
  FROM songs
  WHERE artist_id IS NULL;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Fix Summary:';
  RAISE NOTICE '  Songs fixed: %', fixed_count;
  RAISE NOTICE '  Songs still with null artist_id: %', remaining_count;
  RAISE NOTICE '========================================';
END $$;

-- Note: The function get_or_create_artist() is kept for future use
-- If you want to remove it, uncomment the line below:
-- DROP FUNCTION IF EXISTS get_or_create_artist(TEXT);

