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
-- Done! Your NovaTok QR Hub database is ready.
-- =============================================
