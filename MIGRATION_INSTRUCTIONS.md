# Database Migration Instructions
## PhinAccords - Run This Migration Now!

**IMPORTANT**: You must run this migration in Supabase to enable subscription features!

## Quick Migration Steps

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project: `zwvappfxasxuzoyxxkyd`

2. **Open SQL Editor**
   - Click **SQL Editor** in left sidebar
   - Click **New Query**

3. **Copy and Run Migration**
   - Open file: `supabase/migrations/002_add_subscription_fields.sql`
   - **Copy the ENTIRE contents** (see below)
   - Paste into SQL Editor
   - Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)

4. **Verify Success**
   - Go to **Table Editor** → `user_profiles`
   - You should see new columns:
     - `subscription_tier`
     - `subscription_status`
     - `subscription_start_date`
     - `subscription_end_date`
     - `billing_cycle`
     - `auto_renew`
     - `cancel_at_period_end`
     - `is_first_year`

## Migration SQL

```sql
-- Migration: Add subscription fields to user_profiles table
-- PhinAccords - Heavenkeys Ltd
-- Date: 2025-11-07

-- Add subscription tier enum type
DO $$ BEGIN
  CREATE TYPE subscription_tier AS ENUM ('free', 'basic', 'premium', 'premium_toolkit');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add subscription status enum type
DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'trial');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add subscription fields to user_profiles table
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS subscription_tier subscription_tier DEFAULT 'free'::subscription_tier,
ADD COLUMN IF NOT EXISTS subscription_status subscription_status DEFAULT 'active'::subscription_status,
ADD COLUMN IF NOT EXISTS subscription_start_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS subscription_end_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS billing_cycle character varying DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
ADD COLUMN IF NOT EXISTS auto_renew boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_first_year boolean DEFAULT false;

-- Add index for subscription queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_tier 
ON public.user_profiles(subscription_tier);

CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_status 
ON public.user_profiles(subscription_status);

-- Add comment to table
COMMENT ON COLUMN public.user_profiles.subscription_tier IS 'User subscription tier: free, basic, premium, or premium_toolkit';
COMMENT ON COLUMN public.user_profiles.subscription_status IS 'Subscription status: active, cancelled, expired, or trial';
COMMENT ON COLUMN public.user_profiles.billing_cycle IS 'Billing cycle: monthly or yearly';
COMMENT ON COLUMN public.user_profiles.is_first_year IS 'True if user is in first year of Premium + Toolkit (special pricing)';
```

## Why This Migration is Needed

Without this migration:
- ❌ Subscription features won't work
- ❌ Premium toolbar won't show
- ❌ Toolkit features won't be accessible
- ❌ Upload feature will fail

After running this migration:
- ✅ All subscription features work
- ✅ Premium features are gated correctly
- ✅ Users can upgrade subscriptions
- ✅ Feature flags work properly

## Troubleshooting

**Error**: "type subscription_tier already exists"
- ✅ This is OK - the migration is idempotent
- The `IF NOT EXISTS` clauses prevent errors

**Error**: "column subscription_tier already exists"
- ✅ This is OK - migration was already run
- Your database is up to date!

**Error**: Permission denied
- Check you have admin access to the project
- Verify you're using the correct Supabase project

## Verification Query

After running the migration, verify it worked:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
AND column_name LIKE 'subscription%'
ORDER BY column_name;
```

You should see 8 rows returned.

---

**Status**: ⚠️ **ACTION REQUIRED** - Run this migration now!
**File**: `supabase/migrations/002_add_subscription_fields.sql`

