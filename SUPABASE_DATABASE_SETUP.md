# Supabase Database Setup Guide

This guide will help you set up all the database tables in your Supabase project.

## Quick Setup

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase project dashboard**
   - Visit [supabase.com](https://supabase.com)
   - Select your project: `zwvappfxasxuzoyxxkyd`

2. **Open SQL Editor**
   - Click on **SQL Editor** in the left sidebar
   - Click **New Query**

3. **Run the Migration**
   - Open the file: `supabase/migrations/001_initial_schema.sql`
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)

4. **Verify Tables Created**
   - Go to **Table Editor** in the left sidebar
   - You should see all these tables:
     - `artists`
     - `users`
     - `resources`
     - `songs`
     - `piano_chords`
     - `user_profiles`
     - `favorites`
     - `ratings`
     - `song_requests`
     - `email_campaigns`
     - `user_activities`
     - `user_analytics`
     - `user_sessions`

### Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref zwvappfxasxuzoyxxkyd

# Run migrations
supabase db push
```

## What's Included

### Tables Created

1. **artists** - Store artist information
2. **users** - Extended user profiles (links to Supabase Auth)
3. **resources** - Downloadable resources (PDFs, files, etc.)
4. **songs** - Song catalog with chords, lyrics, and metadata
5. **piano_chords** - Piano chord library with diagrams
6. **user_profiles** - Additional user profile information
7. **favorites** - User favorite songs and resources
8. **ratings** - User ratings and reviews
9. **song_requests** - User song requests
10. **email_campaigns** - Email marketing campaigns
11. **user_activities** - User activity tracking
12. **user_analytics** - Analytics data
13. **user_sessions** - User session tracking

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Policies** configured for:
  - Public read access to songs, artists, resources, piano chords
  - Users can only access their own data (favorites, ratings, profiles)
  - Admins have full access to all tables

### Indexes

Performance indexes created on:
- Foreign key columns
- Frequently queried columns (slug, status, created_at)
- User-related queries

## Post-Setup Steps

### 1. Create a Function to Sync Auth Users

After running the migration, create a function to automatically create a user record when someone signs up:

```sql
-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2. Set Up Storage Buckets (Optional)

If you need file storage for images, audio files, etc.:

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('song-files', 'song-files', true),
  ('artist-images', 'artist-images', true),
  ('user-avatars', 'user-avatars', true),
  ('resources', 'resources', true);
```

### 3. Test the Connection

Test that everything works by running this in your Next.js app:

```typescript
import { supabase } from '@/lib/supabase'

// Test query
const { data, error } = await supabase
  .from('artists')
  .select('*')
  .limit(5)

if (error) {
  console.error('Database connection error:', error)
} else {
  console.log('Database connected!', data)
}
```

## Troubleshooting

### Error: "relation auth.users does not exist"
- This is normal - `auth.users` is managed by Supabase Auth
- The foreign key constraint will work once users sign up

### Error: "permission denied for table"
- Check that RLS policies are correctly set
- Verify your user role in the `users` table

### Error: "duplicate key value violates unique constraint"
- The tables may already exist
- Drop existing tables first or use `CREATE TABLE IF NOT EXISTS`

## Next Steps

1. ✅ Run the migration SQL
2. ✅ Create the user sync function
3. ✅ Set up storage buckets (if needed)
4. ✅ Test the connection
5. ✅ Start building your app features!

For more information, see the [Supabase Documentation](https://supabase.com/docs).

