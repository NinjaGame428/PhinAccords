-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_role enum type
CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');

-- Create artists table
CREATE TABLE IF NOT EXISTS public.artists (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  bio text,
  image_url text,
  website text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT artists_pkey PRIMARY KEY (id)
);

-- Create users table (references auth.users from Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  full_name text,
  avatar_url text,
  role user_role DEFAULT 'user'::user_role,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  first_name text,
  last_name text,
  join_date timestamp with time zone DEFAULT now(),
  preferences jsonb DEFAULT '{"theme": "light", "language": "en", "notifications": true}'::jsonb,
  stats jsonb DEFAULT '{"lastActive": null, "ratingsGiven": 0, "favoriteSongs": 0, "downloadedResources": 0}'::jsonb,
  is_banned boolean DEFAULT false,
  ban_reason text,
  ban_expires_at timestamp with time zone,
  status character varying DEFAULT 'active'::character varying,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create resources table (no foreign keys, can be created early)
CREATE TABLE IF NOT EXISTS public.resources (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text,
  category text,
  file_url text,
  file_size bigint,
  downloads integer DEFAULT 0,
  rating numeric DEFAULT 0,
  author text DEFAULT 'Heavenkeys Music Academy'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT resources_pkey PRIMARY KEY (id)
);

-- Create songs table
CREATE TABLE IF NOT EXISTS public.songs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  artist_id uuid,
  genre character varying,
  key_signature character varying,
  difficulty character varying,
  category character varying,
  year integer,
  tempo character varying,
  time_signature character varying,
  chords text[],
  chord_progression text,
  lyrics text,
  chord_chart text,
  capo character varying,
  strumming_pattern text,
  tags text[],
  description text,
  rating numeric DEFAULT 0,
  downloads integer DEFAULT 0,
  youtube_url text,
  thumbnail_url text,
  duration character varying,
  published_at timestamp with time zone,
  quality character varying,
  language character varying,
  captions_available boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  slug text,
  artist text,
  youtube_id text,
  original_key text,
  CONSTRAINT songs_pkey PRIMARY KEY (id),
  CONSTRAINT songs_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES public.artists(id) ON DELETE SET NULL
);

-- Create piano_chords table
CREATE TABLE IF NOT EXISTS public.piano_chords (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  chord_name text NOT NULL,
  chord_type text,
  root_note text,
  notes text[] NOT NULL,
  intervals text,
  alternate_name text,
  difficulty text DEFAULT 'Medium'::text CHECK (difficulty = ANY (ARRAY['Easy'::text, 'Medium'::text, 'Hard'::text])),
  description text,
  fingering text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  key_signature text NOT NULL,
  inversion integer DEFAULT 0,
  root_name text,
  finger_positions jsonb,
  diagram_svg text,
  diagram_data jsonb,
  chord_name_fr text,
  description_fr text,
  CONSTRAINT piano_chords_pkey PRIMARY KEY (id)
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  full_name character varying,
  avatar_url text,
  bio text,
  preferences jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  song_id uuid,
  resource_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT favorites_pkey PRIMARY KEY (id),
  CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT favorites_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON DELETE CASCADE,
  CONSTRAINT favorites_song_id_fkey FOREIGN KEY (song_id) REFERENCES public.songs(id) ON DELETE CASCADE
);

-- Create ratings table
CREATE TABLE IF NOT EXISTS public.ratings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  song_id uuid,
  resource_id uuid,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ratings_pkey PRIMARY KEY (id),
  CONSTRAINT ratings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT ratings_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON DELETE CASCADE,
  CONSTRAINT ratings_song_id_fkey FOREIGN KEY (song_id) REFERENCES public.songs(id) ON DELETE CASCADE
);

-- Create song_requests table
CREATE TABLE IF NOT EXISTS public.song_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  title text NOT NULL,
  artist text,
  genre text,
  message text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT song_requests_pkey PRIMARY KEY (id),
  CONSTRAINT song_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create email_campaigns table
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  recipient_type text DEFAULT 'all'::text CHECK (recipient_type = ANY (ARRAY['all'::text, 'users'::text, 'admins'::text, 'custom'::text])),
  recipient_ids uuid[],
  status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'scheduled'::text, 'sending'::text, 'sent'::text, 'failed'::text])),
  scheduled_at timestamp with time zone,
  sent_at timestamp with time zone,
  sent_count integer DEFAULT 0,
  open_count integer DEFAULT 0,
  click_count integer DEFAULT 0,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT email_campaigns_pkey PRIMARY KEY (id),
  CONSTRAINT email_campaigns_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL
);

-- Create user_activities table
CREATE TABLE IF NOT EXISTS public.user_activities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  activity_type character varying NOT NULL,
  description text,
  metadata jsonb,
  page character varying,
  action character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_activities_pkey PRIMARY KEY (id),
  CONSTRAINT user_activities_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create user_analytics table
CREATE TABLE IF NOT EXISTS public.user_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  page character varying NOT NULL,
  action character varying,
  metadata jsonb,
  ip_address inet,
  user_agent text,
  referrer text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_analytics_pkey PRIMARY KEY (id),
  CONSTRAINT user_analytics_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  device_type character varying,
  browser character varying,
  operating_system character varying,
  screen_resolution character varying,
  country character varying,
  city character varying,
  region character varying,
  ip_address inet,
  timezone character varying,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_songs_artist_id ON public.songs(artist_id);
CREATE INDEX IF NOT EXISTS idx_songs_slug ON public.songs(slug);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_song_id ON public.favorites(song_id);
CREATE INDEX IF NOT EXISTS idx_favorites_resource_id ON public.favorites(resource_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON public.ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_song_id ON public.ratings(song_id);
CREATE INDEX IF NOT EXISTS idx_ratings_resource_id ON public.ratings(resource_id);
CREATE INDEX IF NOT EXISTS idx_song_requests_user_id ON public.song_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_song_requests_status ON public.song_requests(status);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON public.user_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON public.user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_created_at ON public.user_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piano_chords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.song_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (users can read their own data, admins can read all)
-- Artists: Public read access
CREATE POLICY "Artists are viewable by everyone" ON public.artists FOR SELECT USING (true);

-- Songs: Public read access
CREATE POLICY "Songs are viewable by everyone" ON public.songs FOR SELECT USING (true);

-- Resources: Public read access
CREATE POLICY "Resources are viewable by everyone" ON public.resources FOR SELECT USING (true);

-- Piano Chords: Public read access
CREATE POLICY "Piano chords are viewable by everyone" ON public.piano_chords FOR SELECT USING (true);

-- Users: Users can view their own profile, admins can view all
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- User Profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Favorites: Users can manage their own favorites
CREATE POLICY "Users can view own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- Ratings: Users can manage their own ratings
CREATE POLICY "Users can view own ratings" ON public.ratings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ratings" ON public.ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ratings" ON public.ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ratings" ON public.ratings FOR DELETE USING (auth.uid() = user_id);

-- Song Requests: Users can manage their own requests
CREATE POLICY "Users can view own song requests" ON public.song_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own song requests" ON public.song_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own song requests" ON public.song_requests FOR UPDATE USING (auth.uid() = user_id);

-- User Activities: Users can view their own activities
CREATE POLICY "Users can view own activities" ON public.user_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activities" ON public.user_activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Analytics: Users can view their own analytics
CREATE POLICY "Users can view own analytics" ON public.user_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analytics" ON public.user_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Sessions: Users can view their own sessions
CREATE POLICY "Users can view own sessions" ON public.user_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.user_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Email Campaigns: Only admins can manage
CREATE POLICY "Admins can manage email campaigns" ON public.email_campaigns FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

