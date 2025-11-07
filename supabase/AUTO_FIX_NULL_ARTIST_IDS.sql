-- ============================================================================
-- Automatic Trigger to Fix Null Artist IDs
-- ============================================================================
-- This creates a trigger that automatically fixes null artist_ids
-- when songs are inserted or updated with an artist name but no artist_id
-- ============================================================================

-- Function to handle automatic artist_id fixing
CREATE OR REPLACE FUNCTION auto_fix_artist_id()
RETURNS TRIGGER AS $$
DECLARE
  artist_uuid UUID;
BEGIN
  -- Only fix if artist_id is NULL but artist name exists
  IF NEW.artist_id IS NULL AND NEW.artist IS NOT NULL AND TRIM(NEW.artist) != '' THEN
    -- Try to find existing artist by name (case-insensitive)
    SELECT id INTO artist_uuid
    FROM artists
    WHERE LOWER(TRIM(name)) = LOWER(TRIM(NEW.artist))
    LIMIT 1;
    
    -- If artist doesn't exist, create it
    IF artist_uuid IS NULL THEN
      INSERT INTO artists (name, created_at, updated_at)
      VALUES (TRIM(NEW.artist), NOW(), NOW())
      RETURNING id INTO artist_uuid;
    END IF;
    
    -- Set the artist_id
    NEW.artist_id := artist_uuid;
  END IF;
  
  -- Also sync artist text field if we have artist_id but no artist text
  IF NEW.artist_id IS NOT NULL AND (NEW.artist IS NULL OR TRIM(NEW.artist) = '') THEN
    SELECT name INTO NEW.artist
    FROM artists
    WHERE id = NEW.artist_id
    LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for INSERT operations
DROP TRIGGER IF EXISTS trigger_auto_fix_artist_id_insert ON songs;
CREATE TRIGGER trigger_auto_fix_artist_id_insert
  BEFORE INSERT ON songs
  FOR EACH ROW
  EXECUTE FUNCTION auto_fix_artist_id();

-- Create trigger for UPDATE operations
DROP TRIGGER IF EXISTS trigger_auto_fix_artist_id_update ON songs;
CREATE TRIGGER trigger_auto_fix_artist_id_update
  BEFORE UPDATE ON songs
  FOR EACH ROW
  WHEN (NEW.artist_id IS NULL AND NEW.artist IS NOT NULL AND TRIM(NEW.artist) != '')
  EXECUTE FUNCTION auto_fix_artist_id();

-- Verification: Show triggers
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'songs'
  AND trigger_name LIKE '%artist%'
ORDER BY trigger_name;

