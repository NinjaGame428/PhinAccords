# Deploy to Supabase

## Quick Deploy Using Supabase CLI

### Step 1: Install Supabase CLI (if not installed)

**Windows (using Scoop):**
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Windows (using PowerShell):**
```powershell
# Download and install from GitHub releases
# Or use npm install supabase --save-dev (local installation)
```

**macOS/Linux:**
```bash
# Using Homebrew (macOS)
brew install supabase/tap/supabase

# Or download from GitHub releases
```

### Step 2: Login to Supabase
```bash
supabase login
```

### Step 3: Link Your Project
```bash
supabase link --project-ref your-project-ref
```

To find your project ref:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → General
4. Copy the "Reference ID"

### Step 4: Deploy Schema
```bash
# Option A: Using db push (recommended)
supabase db push

# Option B: Run SQL files directly
supabase db execute --file supabase/schema.sql
supabase db execute --file supabase/user-analytics-tables.sql
supabase db execute --file supabase/migration-complete.sql
```

### Step 5: Set Up Environment Variables

Update your Vercel environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - (Optional) For admin operations

## Alternative: Manual Deploy via Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor**
4. Run these files in order:
   - `supabase/schema.sql`
   - `supabase/user-analytics-tables.sql`
   - `supabase/migration-complete.sql`
5. Verify tables exist in **Table Editor**

## Verification

After deployment, verify tables exist:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

Expected tables:
- artists
- email_campaigns
- favorites
- piano_chords
- ratings
- resources
- song_requests
- songs
- user_activities
- user_analytics
- user_profiles
- user_sessions
- users

