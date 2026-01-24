-- =============================================
-- NovaTok QR Hub - Supabase SQL Migrations
-- =============================================
-- Run these in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. Profiles Table (extends Supabase Auth)
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  wallet_address TEXT,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 2. QR Codes Table
-- =============================================
CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'fiat', 
    'crypto', 
    'nova', 
    'nft_mint', 
    'nft_listing', 
    'multi_option'
  )),
  destination_config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  scan_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

-- QR Codes policies
CREATE POLICY "Users can view own QR codes" ON qr_codes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own QR codes" ON qr_codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own QR codes" ON qr_codes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own QR codes" ON qr_codes
  FOR DELETE USING (auth.uid() = user_id);

-- Public policy for QR resolution (anyone can look up a QR by slug)
CREATE POLICY "Anyone can view active QR by slug" ON qr_codes
  FOR SELECT USING (is_active = true);

-- Index for fast slug lookups
CREATE INDEX IF NOT EXISTS idx_qr_codes_slug ON qr_codes(slug);
CREATE INDEX IF NOT EXISTS idx_qr_codes_user_id ON qr_codes(user_id);

-- =============================================
-- 3. QR Events Table (Analytics)
-- =============================================
CREATE TABLE IF NOT EXISTS qr_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  qr_code_id UUID REFERENCES qr_codes(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'scan',
    'clicked',
    'paid',
    'minted',
    'redirect'
  )),
  country TEXT,
  user_agent TEXT,
  ip_hash TEXT, -- Hashed IP for privacy
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE qr_events ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Users can view events for own QR codes" ON qr_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM qr_codes 
      WHERE qr_codes.id = qr_events.qr_code_id 
      AND qr_codes.user_id = auth.uid()
    )
  );

-- Allow inserting events (for anonymous tracking)
CREATE POLICY "Anyone can insert events" ON qr_events
  FOR INSERT WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_qr_events_qr_code_id ON qr_events(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_qr_events_created_at ON qr_events(created_at);

-- =============================================
-- 4. Function to increment scan count
-- =============================================
CREATE OR REPLACE FUNCTION increment_scan_count(qr_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE qr_codes 
  SET scan_count = scan_count + 1, updated_at = NOW()
  WHERE slug = qr_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 5. User Plans Table (Subscription Management)
-- =============================================
-- Stores subscription plan information for each user
-- Supports Free, Pro, and Business tiers with Stripe integration

CREATE TABLE IF NOT EXISTS user_plans (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;

-- User Plans policies
-- Users can only view their own plan
CREATE POLICY "Users can view own plan" ON user_plans
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only update their own plan (for profile updates, not plan changes)
-- Plan changes should go through server-side Stripe webhook handlers
CREATE POLICY "Users can update own plan" ON user_plans
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow inserts for own user_id (used on signup)
CREATE POLICY "Users can insert own plan" ON user_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_plans_plan ON user_plans(plan);
CREATE INDEX IF NOT EXISTS idx_user_plans_stripe_customer ON user_plans(stripe_customer_id);

-- =============================================
-- 6. Trigger to create user_plan on signup
-- =============================================
-- Update the handle_new_user function to also create a user_plans row

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  
  -- Create user_plan with free tier
  INSERT INTO public.user_plans (user_id, plan)
  VALUES (new.id, 'free');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: The trigger on_auth_user_created already exists and will use the updated function

-- =============================================
-- 7. Helper function to get effective plan
-- =============================================
-- Returns the user's effective plan, checking if subscription is still valid

CREATE OR REPLACE FUNCTION get_effective_plan(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_plan TEXT;
  v_period_end TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT plan, current_period_end 
  INTO v_plan, v_period_end
  FROM user_plans 
  WHERE user_id = p_user_id;
  
  -- If no plan found, return 'free'
  IF v_plan IS NULL THEN
    RETURN 'free';
  END IF;
  
  -- If plan is free, just return it
  IF v_plan = 'free' THEN
    RETURN 'free';
  END IF;
  
  -- For paid plans, check if subscription is still valid
  IF v_period_end IS NOT NULL AND v_period_end < NOW() THEN
    -- Subscription expired, return 'free'
    -- Note: In production, you might want to add grace period logic here
    RETURN 'free';
  END IF;
  
  RETURN v_plan;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 8. View for user plan with effective status
-- =============================================
CREATE OR REPLACE VIEW user_plans_effective AS
SELECT 
  user_id,
  plan as stored_plan,
  get_effective_plan(user_id) as effective_plan,
  stripe_customer_id,
  stripe_subscription_id,
  current_period_end,
  CASE 
    WHEN plan = 'free' THEN true
    WHEN current_period_end IS NULL THEN false
    WHEN current_period_end > NOW() THEN true
    ELSE false
  END as is_active,
  created_at,
  updated_at
FROM user_plans;

-- =============================================
-- 9. Plan limits configuration (for reference)
-- =============================================
-- This is a reference table for plan limits
-- Can be used by the application to enforce limits

CREATE TABLE IF NOT EXISTS plan_limits (
  plan TEXT PRIMARY KEY CHECK (plan IN ('free', 'pro', 'business')),
  max_qr_codes INTEGER NOT NULL,
  max_scans_per_month INTEGER,  -- NULL means unlimited
  custom_domains BOOLEAN DEFAULT false,
  analytics_retention_days INTEGER DEFAULT 30,
  priority_support BOOLEAN DEFAULT false,
  api_access BOOLEAN DEFAULT false,
  white_label BOOLEAN DEFAULT false
);

-- Insert default plan limits
INSERT INTO plan_limits (plan, max_qr_codes, max_scans_per_month, custom_domains, analytics_retention_days, priority_support, api_access, white_label)
VALUES 
  ('free', 5, 1000, false, 7, false, false, false),
  ('pro', 50, 50000, true, 90, true, true, false),
  ('business', -1, NULL, true, 365, true, true, true)  -- -1 means unlimited
ON CONFLICT (plan) DO UPDATE SET
  max_qr_codes = EXCLUDED.max_qr_codes,
  max_scans_per_month = EXCLUDED.max_scans_per_month,
  custom_domains = EXCLUDED.custom_domains,
  analytics_retention_days = EXCLUDED.analytics_retention_days,
  priority_support = EXCLUDED.priority_support,
  api_access = EXCLUDED.api_access,
  white_label = EXCLUDED.white_label;

-- =============================================
-- Done! Your NovaTok QR Hub database is ready.
-- =============================================
