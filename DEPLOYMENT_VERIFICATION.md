# Database Deployment Verification

## Current Database Schema Status

All required database structures are included in `supabase/QUICK_DEPLOY.sql`. This script ensures:

### ✅ Core Tables
1. **artists** - Stores artist information
   - `id` (UUID, Primary Key)
   - `name` (TEXT, NOT NULL)
   - `bio` (TEXT)
   - `image_url` (TEXT)
   - `website` (TEXT)
   - `created_at`, `updated_at` (Timestamps)

2. **songs** - Stores song information with artist relationship
   - `id` (UUID, Primary Key)
   - `title` (TEXT, NOT NULL)
   - `artist` (TEXT) - Backward compatibility field
   - `artist_id` (UUID, Foreign Key → artists.id) - **NEW: Links to artists table**
   - `slug` (TEXT, UNIQUE)
   - `key_signature` (TEXT)
   - `tempo` (INTEGER)
   - `lyrics` (TEXT)
   - `chords` (TEXT[])
   - `youtube_id` (TEXT)
   - `created_at`, `updated_at` (Timestamps)

### ✅ Database Features
- **Foreign Key Constraint**: `songs.artist_id` → `artists.id`
- **Indexes**: Created for performance on `artist_id`, `artist`, `slug`, etc.
- **RLS Policies**: Row Level Security enabled for all tables
- **Triggers**: Auto-update `updated_at` timestamps
- **Idempotent Script**: Can be run multiple times safely (uses `IF NOT EXISTS`)

## How to Deploy to Supabase

1. **Open Supabase Dashboard**
   - Go to your Supabase project: https://zsujkjbvliqphssuvvyw.supabase.co
   - Navigate to SQL Editor

2. **Run the Deployment Script**
   - Copy the entire contents of `supabase/QUICK_DEPLOY.sql`
   - Paste into the SQL Editor
   - Click "Run" (or press Ctrl+Enter)

3. **Verify Deployment**
   - Check that all tables exist in the Table Editor
   - Verify foreign key relationships are working
   - Test by creating a song with an artist_id

## What the Script Does

The `QUICK_DEPLOY.sql` script:
- ✅ Creates all required tables if they don't exist
- ✅ Adds missing columns to existing tables (artist_id, artist, youtube_id)
- ✅ Creates indexes for performance
- ✅ Sets up RLS (Row Level Security) policies
- ✅ Creates triggers for auto-updating timestamps
- ✅ Handles existing data gracefully (won't break if tables already exist)

## Current Features Implemented

### Song Updates with Artist Tracking
- ✅ Tracks old artist_id before updating
- ✅ Updates both `artist_id` and `artist` text field
- ✅ Returns verified data (not stale cache)
- ✅ Broadcasts events when artist changes

### Artist Count Management
- ✅ Counts are calculated dynamically from `songs` table
- ✅ Automatically updates when `song.artist_id` changes
- ✅ UI refreshes immediately via event listeners

### Real-time Updates
- ✅ CustomEvent system for same-tab communication
- ✅ localStorage for cross-tab communication
- ✅ Artist pages listen and refresh automatically

## Verification Checklist

After running the script, verify:

- [ ] `artists` table exists with required columns
- [ ] `songs` table exists with `artist_id` foreign key
- [ ] Foreign key constraint `songs_artist_id_fkey` is created
- [ ] Index `idx_songs_artist_id` exists
- [ ] RLS policies are enabled
- [ ] Triggers are created for `updated_at`

## Testing

After deployment, test:

1. **Create an artist** in the admin panel
2. **Create a song** linked to that artist
3. **Edit the song** and change the artist
4. **Verify** the old artist count decreases by 1
5. **Verify** the new artist count increases by 1
6. **Check** both artist pages reflect correct counts

## Notes

- Artist counts are **NOT stored** in the database
- Counts are **calculated dynamically** on each query
- This ensures counts are always accurate
- Performance is optimized with indexes on `artist_id`

