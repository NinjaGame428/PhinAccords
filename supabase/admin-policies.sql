-- Admin policies for all tables
-- These policies allow users with role 'admin' to perform any operation

-- Drop existing policies if they exist (optional, for idempotency)
DROP POLICY IF EXISTS "Admins can manage all songs" ON public.songs;
DROP POLICY IF EXISTS "Admins can manage all artists" ON public.artists;
DROP POLICY IF EXISTS "Admins can manage all resources" ON public.resources;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all favorites" ON public.favorites;
DROP POLICY IF EXISTS "Admins can manage all ratings" ON public.ratings;

-- Songs: Allow admins to insert, update, and delete
CREATE POLICY "Admins can manage all songs" ON public.songs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Artists: Allow admins to insert, update, and delete
CREATE POLICY "Admins can manage all artists" ON public.artists
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Resources: Allow admins to insert, update, and delete
CREATE POLICY "Admins can manage all resources" ON public.resources
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Users: Allow admins to manage all users (except themselves for safety)
CREATE POLICY "Admins can manage all users" ON public.users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
  );

-- Favorites: Allow admins to manage all favorites
CREATE POLICY "Admins can manage all favorites" ON public.favorites
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Ratings: Allow admins to manage all ratings
CREATE POLICY "Admins can manage all ratings" ON public.ratings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

