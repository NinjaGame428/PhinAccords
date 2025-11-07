# Supabase Deployment Steps

## ✅ Completed

1. **Environment Variables Set in Vercel**
   - `NEXT_PUBLIC_SUPABASE_URL` - Set ✅
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Set ✅

2. **Code Migration Complete**
   - All API routes migrated to Supabase ✅
   - Authentication updated to use Supabase Auth ✅
   - Removed Neon dependencies ✅

## 🔧 Next Steps: Deploy Database Schema

### Method 1: Supabase Dashboard (Recommended - Easiest)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `zsujkjbvliqphssuvvyw`

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run Schema Files in Order**
   
   **Step 1: Run Main Schema**
   - Copy contents of `supabase/schema.sql`
   - Paste into SQL Editor
   - Click "Run" or press Ctrl+Enter
   - Wait for success message

   **Step 2: Run User Analytics Tables**
   - Copy contents of `supabase/user-analytics-tables.sql`
   - Paste into SQL Editor
   - Click "Run"
   - Wait for success message

   **Step 3: Run Migration Complete**
   - Copy contents of `supabase/migration-complete.sql`
   - Paste into SQL Editor
   - Click "Run"
   - Wait for success message

4. **Verify Tables**
   - Go to "Table Editor" in left sidebar
   - You should see these tables:
     - ✅ artists
     - ✅ songs
     - ✅ users
     - ✅ resources
     - ✅ favorites
     - ✅ ratings
     - ✅ email_campaigns
     - ✅ user_analytics
     - ✅ user_activity (or user_activities)
     - ✅ user_sessions
     - ✅ song_requests

### Method 2: Supabase CLI

If you have Supabase CLI installed:

```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref zsujkjbvliqphssuvvyw

# Push schema
supabase db push
```

## 🚀 After Schema Deployment

1. **Test the Application**
   - Visit your Vercel deployment URL
   - Test user registration: `/register`
   - Test user login: `/login`
   - Test viewing songs: `/songs`

2. **Optional: Add Service Role Key**
   If you need admin operations:
   - Go to Supabase Dashboard → Settings → API
   - Copy the `service_role` key
   - Add to Vercel: `vercel env add SUPABASE_SERVICE_ROLE_KEY production`

## 📝 Notes

- The `users` table will be automatically populated when users sign up via Supabase Auth
- The trigger `handle_new_user()` creates a profile in `public.users` when a user signs up
- All tables have Row Level Security (RLS) enabled
- Check RLS policies if you encounter permission issues

## 🐛 Troubleshooting

**Error: "relation does not exist"**
- Make sure you ran all three SQL files in order
- Check Table Editor to see which tables exist

**Error: "permission denied"**
- Check RLS policies in Supabase Dashboard
- Verify you're using the correct anon key

**Users can't register/login**
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly
- Check Supabase Dashboard → Authentication → Settings
- Ensure email auth is enabled

