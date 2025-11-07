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

