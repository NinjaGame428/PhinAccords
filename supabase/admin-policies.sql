-- Admin policies for all tables
-- These policies allow users with role 'admin' to perform any operation

-- First, create a security definer function to check admin status without recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function runs with the privileges of the function owner (postgres)
  -- and bypasses RLS, so it won't cause recursion
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  );
END;
$$;

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
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Artists: Allow admins to insert, update, and delete
CREATE POLICY "Admins can manage all artists" ON public.artists
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Resources: Allow admins to insert, update, and delete
CREATE POLICY "Admins can manage all resources" ON public.resources
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Users: Allow admins to manage all users
-- Use the security definer function to avoid recursion
CREATE POLICY "Admins can manage all users" ON public.users
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Favorites: Allow admins to manage all favorites
CREATE POLICY "Admins can manage all favorites" ON public.favorites
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Ratings: Allow admins to manage all ratings
CREATE POLICY "Admins can manage all ratings" ON public.ratings
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

