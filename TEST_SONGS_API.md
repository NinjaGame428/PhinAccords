# Testing Songs Display

## Quick Test Steps

1. **Start the dev server** (already running):
   ```bash
   npm run dev
   ```

2. **Check Browser Console**:
   - Open http://localhost:3000/songs
   - Open DevTools (F12) → Console tab
   - Look for these logs:
     - `📊 Songs API Response:` - Shows what the API returned
     - `✅ Successfully fetched X songs` - Server-side log
     - `⚠️ Song without artist:` - Songs missing artist info

3. **Check Network Tab**:
   - Open DevTools → Network tab
   - Find the request to `/api/songs?limit=24`
   - Check the Response to see what data is being returned

## Common Issues & Fixes

### Issue: Empty songs array
**Possible causes:**
1. **RLS Policy blocking access** - Check Supabase RLS policies allow anonymous reads
2. **Table doesn't exist** - Deploy schema.sql first
3. **No songs in database** - Add songs via Supabase dashboard

**Fix:**
```sql
-- In Supabase SQL Editor, ensure this policy exists:
CREATE POLICY "Anyone can view songs" ON public.songs
  FOR SELECT USING (true);
```

### Issue: Songs exist but not displaying
**Check:**
- Artist field exists: `song.artist` or `song.artists.name`
- Console shows songs but they're filtered out

**Fix:**
- Ensure songs have either `artist` text field OR `artist_id` with matching artist in `artists` table

### Issue: 500 Error
**Check server logs:**
- Look at terminal where `npm run dev` is running
- Check for database connection errors
- Verify `.env.local` has correct Supabase credentials

## Manual Database Check

Run in Supabase SQL Editor:
```sql
-- Check if songs table exists and has data
SELECT COUNT(*) as total_songs FROM songs;

-- View sample songs
SELECT id, title, artist, artist_id, created_at 
FROM songs 
LIMIT 10;

-- Check artists
SELECT id, name FROM artists LIMIT 10;
```

