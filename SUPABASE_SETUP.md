# Supabase Setup Guide

## Overview

Supabase provides backend services (database, authentication, storage) for your Next.js app. Your frontend is hosted on Vercel, and Supabase handles the backend.

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in:
   - **Name**: PhinAccords
   - **Database Password**: (choose a strong password)
   - **Region**: (choose closest to your users)
5. Click "Create new project"
6. Wait for project to be ready (~2 minutes)

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Step 3: Configure Environment Variables

### Local Development

Create `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Vercel Production

1. Go to [vercel.com](https://vercel.com)
2. Select your **PhinAccords** project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
   - `SUPABASE_SERVICE_ROLE_KEY` = your service role key (for server-side only)
5. Click "Save"
6. Redeploy your project

## Step 4: Using Supabase in Your App

The Supabase client is already set up in `src/lib/supabase.ts`. You can use it in your components:

```typescript
import { supabase } from '@/lib/supabase'

// Example: Fetch data
const { data, error } = await supabase
  .from('your_table')
  .select('*')

// Example: Authentication
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
})
```

## Step 5: Database Setup (Optional)

If you need a database:

1. Go to Supabase Dashboard → **SQL Editor**
2. Create your tables using SQL
3. Or use the **Table Editor** for a visual interface

Example schema for piano lessons:

```sql
-- Create a lessons table
CREATE TABLE lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  sheet_music_url TEXT,
  difficulty_level INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Create a policy for public read access
CREATE POLICY "Lessons are viewable by everyone"
  ON lessons FOR SELECT
  USING (true);
```

## Step 6: Storage Setup (Optional)

For storing piano lesson files, images, etc.:

1. Go to Supabase Dashboard → **Storage**
2. Create a new bucket (e.g., "piano-lessons")
3. Set bucket to **Public** if files should be accessible
4. Upload files or use the API to upload programmatically

## Step 7: Authentication Setup (Optional)

Supabase provides built-in authentication:

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Enable providers you want (Email, Google, etc.)
3. Configure settings
4. Use in your app:

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Sign out
await supabase.auth.signOut()
```

## Next Steps

- Your frontend is on **Vercel**: https://phin-accords-9g6heett3-jackmichaels-projects.vercel.app
- Your backend is on **Supabase**: Connect via the API keys
- Both work together seamlessly!

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

