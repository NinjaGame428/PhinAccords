-- Complete Database Migration Script
-- This script creates all missing tables and updates existing ones

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- UPDATE EXISTING TABLES
-- ============================================

-- Update songs table to use artist_id instead of artist (if not already updated)
DO $$
BEGIN
  -- Add artist_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'songs' 
    AND column_name = 'artist_id'
  ) THEN
    -- Add artist_id column
    ALTER TABLE public.songs ADD COLUMN artist_id UUID REFERENCES public.artists(id);
    
    -- Migrate existing artist names to artist_id (if needed)
    -- This is a best-effort migration - you may need to manually match artists
    UPDATE public.songs s
    SET artist_id = (
      SELECT id FROM public.artists a 
      WHERE a.name = s.artist 
      LIMIT 1
    )
    WHERE artist_id IS NULL AND artist IS NOT NULL;
    
    -- Create index
    CREATE INDEX IF NOT EXISTS idx_songs_artist_id ON public.songs(artist_id);
  END IF;
  
  -- Keep artist column for backward compatibility (make it nullable)
  ALTER TABLE public.songs ALTER COLUMN artist DROP NOT NULL;
END $$;

-- ============================================
-- CREATE MISSING TABLES
-- ============================================

-- Song Requests Table
CREATE TABLE IF NOT EXISTS public.song_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  artist TEXT,
  genre TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Analytics Table
CREATE TABLE IF NOT EXISTS public.user_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  page VARCHAR(255) NOT NULL,
  action VARCHAR(100),
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Campaigns Table
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  recipient_type TEXT DEFAULT 'all' CHECK (recipient_type IN ('all', 'users', 'admins', 'custom')),
  recipient_ids UUID[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  sent_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Piano Chords Table (optional - for future use)
CREATE TABLE IF NOT EXISTS public.piano_chords (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chord_name TEXT NOT NULL UNIQUE,
  key_signature TEXT NOT NULL,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  notes TEXT[] NOT NULL,
  finger_positions JSONB,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ============================================
-- CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_song_requests_user_id ON public.song_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_song_requests_status ON public.song_requests(status);
CREATE INDEX IF NOT EXISTS idx_song_requests_created_at ON public.song_requests(created_at);

CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON public.user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_page ON public.user_analytics(page);
CREATE INDEX IF NOT EXISTS idx_user_analytics_created_at ON public.user_analytics(created_at);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON public.email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_by ON public.email_campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled_at ON public.email_campaigns(scheduled_at);

CREATE INDEX IF NOT EXISTS idx_piano_chords_key_signature ON public.piano_chords(key_signature);
CREATE INDEX IF NOT EXISTS idx_piano_chords_difficulty ON public.piano_chords(difficulty);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.song_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piano_chords ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE RLS POLICIES
-- ============================================

-- Song Requests Policies
DROP POLICY IF EXISTS "Users can view own song requests" ON public.song_requests;
CREATE POLICY "Users can view own song requests" ON public.song_requests
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create song requests" ON public.song_requests;
CREATE POLICY "Users can create song requests" ON public.song_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all song requests" ON public.song_requests;
CREATE POLICY "Admins can view all song requests" ON public.song_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

DROP POLICY IF EXISTS "Admins can update song requests" ON public.song_requests;
CREATE POLICY "Admins can update song requests" ON public.song_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- User Analytics Policies
DROP POLICY IF EXISTS "Users can view own analytics" ON public.user_analytics;
CREATE POLICY "Users can view own analytics" ON public.user_analytics
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own analytics" ON public.user_analytics;
CREATE POLICY "Users can insert own analytics" ON public.user_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all analytics" ON public.user_analytics;
CREATE POLICY "Admins can view all analytics" ON public.user_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Email Campaigns Policies
DROP POLICY IF EXISTS "Admins can manage email campaigns" ON public.email_campaigns;
CREATE POLICY "Admins can manage email campaigns" ON public.email_campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Piano Chords Policies
DROP POLICY IF EXISTS "Anyone can view piano chords" ON public.piano_chords;
CREATE POLICY "Anyone can view piano chords" ON public.piano_chords
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage piano chords" ON public.piano_chords;
CREATE POLICY "Admins can manage piano chords" ON public.piano_chords
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );


-- ============================================
-- CREATE TRIGGER FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_song_requests_updated_at ON public.song_requests;
CREATE TRIGGER update_song_requests_updated_at
  BEFORE UPDATE ON public.song_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_campaigns_updated_at ON public.email_campaigns;
CREATE TRIGGER update_email_campaigns_updated_at
  BEFORE UPDATE ON public.email_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_piano_chords_updated_at ON public.piano_chords;
CREATE TRIGGER update_piano_chords_updated_at
  BEFORE UPDATE ON public.piano_chords
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on all tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant permissions on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- VERIFICATION
-- ============================================

-- Display all tables created
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';
  
  RAISE NOTICE 'Total tables in public schema: %', table_count;
END $$;

