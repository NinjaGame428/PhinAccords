# Database Migration Guide - Subscription Fields
## PhinAccords - Heavenkeys Ltd

This guide will help you add subscription fields to your Supabase database.

## Quick Setup

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase project dashboard**
   - Visit [supabase.com](https://supabase.com)
   - Select your project

2. **Open SQL Editor**
   - Click on **SQL Editor** in the left sidebar
   - Click **New Query**

3. **Run the Migration**
   - Open the file: `supabase/migrations/002_add_subscription_fields.sql`
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)

4. **Verify Changes**
   - Go to **Table Editor** in the left sidebar
   - Select `user_profiles` table
   - You should see these new columns:
     - `subscription_tier` (enum: free, basic, premium, premium_toolkit)
     - `subscription_status` (enum: active, cancelled, expired, trial)
     - `subscription_start_date` (timestamp)
     - `subscription_end_date` (timestamp)
     - `billing_cycle` (varchar: monthly, yearly)
     - `auto_renew` (boolean)
     - `cancel_at_period_end` (boolean)
     - `is_first_year` (boolean)

### Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

## What's Added

### New Enum Types

1. **subscription_tier**
   - Values: `free`, `basic`, `premium`, `premium_toolkit`
   - Default: `free`

2. **subscription_status**
   - Values: `active`, `cancelled`, `expired`, `trial`
   - Default: `active`

### New Columns in `user_profiles`

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `subscription_tier` | subscription_tier | 'free' | User's subscription tier |
| `subscription_status` | subscription_status | 'active' | Current subscription status |
| `subscription_start_date` | timestamp | NULL | When subscription started |
| `subscription_end_date` | timestamp | NULL | When subscription expires |
| `billing_cycle` | varchar | 'monthly' | Monthly or yearly billing |
| `auto_renew` | boolean | true | Auto-renewal enabled |
| `cancel_at_period_end` | boolean | false | Cancel at period end |
| `is_first_year` | boolean | false | First year special pricing flag |

### Indexes Created

- `idx_user_profiles_subscription_tier` - For fast queries by tier
- `idx_user_profiles_subscription_status` - For fast queries by status

## Testing the Migration

After running the migration, you can test it:

```sql
-- Check if columns exist
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
AND column_name LIKE 'subscription%';

-- Check enum types
SELECT typname, typtype
FROM pg_type
WHERE typname IN ('subscription_tier', 'subscription_status');

-- Test insert
INSERT INTO user_profiles (user_id, subscription_tier, subscription_status)
VALUES ('00000000-0000-0000-0000-000000000000', 'premium', 'active')
ON CONFLICT (user_id) DO NOTHING;
```

## Rollback (if needed)

If you need to rollback this migration:

```sql
-- Remove columns
ALTER TABLE public.user_profiles
DROP COLUMN IF EXISTS subscription_tier,
DROP COLUMN IF EXISTS subscription_status,
DROP COLUMN IF EXISTS subscription_start_date,
DROP COLUMN IF EXISTS subscription_end_date,
DROP COLUMN IF EXISTS billing_cycle,
DROP COLUMN IF EXISTS auto_renew,
DROP COLUMN IF EXISTS cancel_at_period_end,
DROP COLUMN IF EXISTS is_first_year;

-- Remove indexes
DROP INDEX IF EXISTS idx_user_profiles_subscription_tier;
DROP INDEX IF EXISTS idx_user_profiles_subscription_status;

-- Remove enum types (only if not used elsewhere)
-- DROP TYPE IF EXISTS subscription_tier;
-- DROP TYPE IF EXISTS subscription_status;
```

## Next Steps

After running the migration:

1. **Update your application code** to use the new subscription fields
2. **Set default subscriptions** for existing users (all will be 'free' by default)
3. **Test subscription features** in your application
4. **Set up payment processing** (Stripe, PayPal, etc.) to update these fields

## Security Notes

- Subscription fields are protected by Row Level Security (RLS)
- Users can only read their own subscription data
- Only admins can update subscription tiers
- Consider adding RLS policies for subscription management

---

**Last Updated**: November 2025
**Project**: PhinAccords (Heavenkeys Ltd)

