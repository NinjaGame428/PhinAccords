# Deploy Database Schema to Supabase

## Quick Deployment Steps

Your Supabase Project:
- **URL**: `https://zsujkjbvliqphssuvvyw.supabase.co`
- **Project Ref**: `zsujkjbvliqphssuvvyw`

### Method 1: Supabase Dashboard (Easiest - Recommended)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/zsujkjbvliqphssuvvyw
   - Or navigate to: https://supabase.com/dashboard → Select your project

2. **Open SQL Editor**
   - Click **"SQL Editor"** in the left sidebar
   - Click **"New query"** button (top right)

3. **Copy SQL Script**
   - Open the file: `supabase/QUICK_DEPLOY.sql`
   - Select all (Ctrl+A) and copy (Ctrl+C)

4. **Paste and Run**
   - Paste into the SQL Editor
   - Click **"Run"** button or press `Ctrl+Enter`
   - Wait for the script to complete (should take 5-10 seconds)

5. **Verify Success**
   - You should see "Success. No rows returned" or similar
   - Run this verification query:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_type = 'BASE TABLE'
   ORDER BY table_name;
   ```
   - You should see 14 tables listed

### Method 2: Using Node Script

```bash
# Install dependencies if needed
npm install dotenv

# Run the deployment script
node supabase/deploy-schema.js
```

This will show you the instructions and SQL file location.

### Method 3: Direct File Copy

1. Open `supabase/QUICK_DEPLOY.sql` in your editor
2. Copy the entire file contents
3. Paste into Supabase SQL Editor
4. Run

## What Gets Created

The script creates all these tables:

✅ **Core Tables:**
- `users` - User profiles with roles and preferences
- `artists` - Artist information
- `songs` - Songs with `artist_id` foreign key
- `resources` - Learning resources
- `favorites` - User favorite songs/resources
- `ratings` - User ratings for songs/resources

✅ **Analytics Tables:**
- `user_sessions` - User session tracking
- `user_activities` - User activity logs
- `user_profiles` - Extended user profiles
- `user_analytics` - Analytics data

✅ **Additional Tables:**
- `song_requests` - Song request submissions
- `email_campaigns` - Email campaign management
- `piano_chords` - Piano chord definitions (for future use)

All tables include:
- ✅ Proper indexes for performance
- ✅ Row Level Security (RLS) policies
- ✅ Foreign key relationships
- ✅ Triggers for `updated_at` timestamps
- ✅ Proper data types and constraints

## Important Notes

1. **Backup First**: If you have existing data, backup your database first
2. **No Data Loss**: The script uses `CREATE TABLE IF NOT EXISTS`, so existing tables won't be overwritten
3. **Artist ID Migration**: The `songs` table now has both `artist` (text) and `artist_id` (UUID foreign key) columns
4. **RLS Policies**: All tables have Row Level Security enabled for data protection

## Troubleshooting

### Error: "permission denied"
- Make sure you're logged into Supabase Dashboard
- Check that you have admin access to the project

### Error: "relation already exists"
- This is normal - the script uses `IF NOT EXISTS` clauses
- Existing tables won't be modified

### Error: "foreign key constraint"
- Run the script in order (it's already ordered correctly)
- Make sure parent tables (users, artists) exist before child tables

## Verification Queries

After deployment, run these to verify:

```sql
-- Count all tables
SELECT COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check songs table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'songs'
ORDER BY ordinal_position;
```

## Next Steps

After deploying:
1. ✅ Update your `.env.local` with the Supabase credentials (already done)
2. ✅ Test the application - it should now work with all tables
3. ✅ Add some sample data via the admin panel

