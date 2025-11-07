# Update Vercel Environment Variables

## New Supabase Credentials

Update these environment variables in your Vercel project:

### Required Variables

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Value: `https://zwvappfxasxuzoyxxkyd.supabase.co`
   - Environments: Production, Preview, Development

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3dmFwcGZ4YXN4dXpveXh4a3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0ODQzODcsImV4cCI6MjA3ODA2MDM4N30.7rzBTtuK4MdysNtpZYPQp9nQQ2dMFzWwbk8Qxl-8i2Q`
   - Environments: Production, Preview, Development

### Steps to Update in Vercel

1. Go to [vercel.com](https://vercel.com)
2. Select your **PhinAccords** project
3. Go to **Settings** → **Environment Variables**
4. Find `NEXT_PUBLIC_SUPABASE_URL` and update the value
5. Find `NEXT_PUBLIC_SUPABASE_ANON_KEY` and update the value
6. Click **Save** for each variable
7. Go to **Deployments** → Click **⋯** on latest deployment → **Redeploy**

### Get Service Role Key (if needed)

If you need the service role key for server-side operations:

1. Go to your Supabase project dashboard
2. Settings → API
3. Copy the **service_role** key (keep it secret!)
4. Add as `SUPABASE_SERVICE_ROLE_KEY` in Vercel

