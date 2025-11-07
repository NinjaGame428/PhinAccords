# Vercel Environment Variables Setup

## Add Supabase Environment Variables to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Select your **PhinAccords** project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

### Required Variables (Public - for client-side)

- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://pttkmqyuciecvkbddoff.supabase.co`
- **Environment**: Production, Preview, Development

- **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0dGttcXl1Y2llY3ZrYmRkb2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNzY4NDUsImV4cCI6MjA3NDk1Mjg0NX0.fTIR3RXch_uDKLQuSAKXQDOe3jxD0wpvsFack4BXMJ0`
- **Environment**: Production, Preview, Development

### Server-Side Only (Private - keep secret)

- **Name**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0dGttcXl1Y2llY3ZrYmRkb2ZmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTM3Njg0NSwiZXhwIjoyMDc0OTUyODQ1fQ.oG7-KQf9_Ns4ILSq5gaeUcvA_ErX97W0qGI8MNl93f8`
- **Environment**: Production, Preview, Development
- **⚠️ Important**: This key has admin access - never expose it in client-side code!

### Optional Database Variables (if using direct database access)

- **Name**: `POSTGRES_URL`
- **Value**: `postgres://postgres.pttkmqyuciecvkbddoff:85ux2eY6873Ty7HY@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x`
- **Environment**: Production, Preview, Development

- **Name**: `POSTGRES_URL_NON_POOLING`
- **Value**: `postgres://postgres.pttkmqyuciecvkbddoff:85ux2eY6873Ty7HY@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require`
- **Environment**: Production, Preview, Development

- **Name**: `POSTGRES_USER`
- **Value**: `postgres`
- **Environment**: Production, Preview, Development

- **Name**: `POSTGRES_HOST`
- **Value**: `db.pttkmqyuciecvkbddoff.supabase.co`
- **Environment**: Production, Preview, Development

- **Name**: `POSTGRES_PASSWORD`
- **Value**: `85ux2eY6873Ty7HY`
- **Environment**: Production, Preview, Development

- **Name**: `POSTGRES_DATABASE`
- **Value**: `postgres`
- **Environment**: Production, Preview, Development

- **Name**: `POSTGRES_PRISMA_URL`
- **Value**: `postgres://postgres.pttkmqyuciecvkbddoff:85ux2eY6873Ty7HY@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true`
- **Environment**: Production, Preview, Development

- **Name**: `SUPABASE_JWT_SECRET`
- **Value**: `uqLUNpoP1jw0ftdZ6Q6EPmxIpsusk3JKHuL7bMN/npYldLFmVuL9zfp0trfMiVbzrXRv9LktONhWG//7BeaJJQ==`
- **Environment**: Production, Preview, Development

## After Adding Variables

1. Click **Save** after adding each variable
2. Go to **Deployments** tab
3. Click the **⋯** menu on the latest deployment
4. Click **Redeploy** to apply the new environment variables

## Verify Connection

After redeploying, your app will be connected to Supabase. You can test it by:

1. Visiting your Vercel deployment URL
2. Checking the browser console for any Supabase connection errors
3. Using the Supabase client in your code:

```typescript
import { supabase } from '@/lib/supabase'

// Test connection
const { data, error } = await supabase.from('your_table').select('*')
```

