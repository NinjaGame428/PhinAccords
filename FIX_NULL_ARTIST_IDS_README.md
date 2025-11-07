# Fix Null Artist IDs in Database

## Problem
Some songs in the database have `null` values for `artist_id` even though they have an `artist` name. This can cause issues with:
- Song listings (songs may not appear)
- Artist pages (songs won't be linked to artists)
- Song counts (artist song counts may be incorrect)

## Solution

### Option 1: One-Time Fix (Recommended First Step)
Run the script `supabase/FIX_NULL_ARTIST_IDS.sql` in your Supabase SQL Editor:

1. Open your Supabase dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `supabase/FIX_NULL_ARTIST_IDS.sql`
4. Click "Run" to execute

This script will:
- Find all songs with null `artist_id` but with an `artist` name
- Match them to existing artists by name (case-insensitive)
- Create new artists if they don't exist
- Update songs with the correct `artist_id`
- Sync the `artist` text field with the `artist_id`

### Option 2: Automatic Prevention (Recommended After Fix)
To prevent this issue from happening in the future, run `supabase/AUTO_FIX_NULL_ARTIST_IDS.sql`:

1. Open your Supabase dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `supabase/AUTO_FIX_NULL_ARTIST_IDS.sql`
4. Click "Run" to execute

This creates a database trigger that automatically:
- Fixes `artist_id` when songs are inserted/updated with an artist name but no `artist_id`
- Creates missing artists automatically
- Syncs the `artist` text field

## Verification

After running the fix script, verify the results:

```sql
-- Check how many songs still have null artist_id
SELECT COUNT(*) as null_artist_id_count
FROM songs
WHERE artist_id IS NULL;

-- Show songs that still have null artist_id (should be empty or only songs with no artist name)
SELECT 
  id,
  title,
  artist,
  artist_id,
  created_at
FROM songs
WHERE artist_id IS NULL
ORDER BY created_at DESC
LIMIT 10;
```

## Notes

- The fix script uses case-insensitive matching to find artists
- New artists are automatically created if they don't exist
- The `artist` text field is kept for backward compatibility
- The function `get_or_create_artist()` is kept in the database for future use

