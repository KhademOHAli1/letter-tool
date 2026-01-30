-- Fix infinite recursion in user_profiles RLS policies
-- The admin policies were querying user_profiles to check role, causing infinite recursion
--
-- Solution: Use a SECURITY DEFINER function to check admin status, which bypasses RLS

-- Create a helper function to check if the current user is an admin
-- SECURITY DEFINER means this function runs with the privileges of the function owner (postgres)
-- which bypasses RLS policies
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Drop the problematic policies
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;

-- Recreate admin policies using the helper function (no recursion)
CREATE POLICY "Admins can read all profiles"
    ON public.user_profiles
    FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can update all profiles"
    ON public.user_profiles
    FOR UPDATE
    USING (public.is_admin());

COMMENT ON FUNCTION public.is_admin() IS 'Check if the current user has admin role. Uses SECURITY DEFINER to bypass RLS and avoid infinite recursion.';
