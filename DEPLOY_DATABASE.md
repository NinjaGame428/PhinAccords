# Deploy Database to Supabase

## Quick Steps

### 1. Go to Supabase Dashboard
- Visit: https://supabase.com/dashboard
- Select your project: `zsujkjbvliqphssuvvyw`

### 2. Open SQL Editor
- Click "SQL Editor" in the left sidebar
- Click "New query"

### 3. Deploy Schema Files

Run these files **in order**:

#### Step 1: Main Schema
- Copy entire contents of `supabase/schema.sql`
- Paste into SQL Editor
- Click **Run** (or press Ctrl+Enter)
- Wait for success message ✅

#### Step 2: User Analytics Tables (Optional)
- If `supabase/user-analytics-tables.sql` exists, run it
- Same process: Copy → Paste → Run

#### Step 3: Complete Migration
- Copy entire contents of `supabase/migration-complete.sql`
- Paste into SQL Editor
- Click **Run**
- Wait for success message ✅

### 4. Verify Tables

Go to **Table Editor** and verify these tables exist:
- ✅ `songs`
- ✅ `artists`
- ✅ `users`
- ✅ `resources`
- ✅ `favorites`
- ✅ `ratings`

### 5. Test Connection (Optional)

Run locally:
```bash
node scripts/test-supabase-connection.js
```

This will verify:
- ✅ Database connection works
- ✅ Tables are accessible
- ✅ RLS policies allow reading
- ✅ Sample data exists

## Verify Songs Are Accessible

Run this in Supabase SQL Editor:
```sql
-- Check songs count
SELECT COUNT(*) as total_songs FROM songs;

-- View sample songs
SELECT id, title, artist, artist_id, created_at 
FROM songs 
ORDER BY created_at DESC 
LIMIT 10;

-- Check RLS policy
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'songs';
```

## Troubleshooting

### Issue: "relation does not exist"
**Solution:** Run `supabase/schema.sql` first

### Issue: "permission denied"
**Solution:** Ensure RLS policy exists:
```sql
CREATE POLICY "Anyone can view songs" ON public.songs
  FOR SELECT USING (true);
```

### Issue: Songs exist but not showing
**Check:**
1. Songs have `artist` field populated
2. RLS policy allows anonymous reads
3. Test connection: `node scripts/test-supabase-connection.js`

## After Deployment

1. Restart your dev server: `npm run dev`
2. Visit: http://localhost:3000/songs
3. Check browser console for logs
4. Songs should now display! 🎉

