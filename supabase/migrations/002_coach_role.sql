-- Add role, goals, and email columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role  text NOT NULL DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS goals jsonb,
  ADD COLUMN IF NOT EXISTS email text;

-- Security-definer function to check if current user is a coach.
-- SECURITY DEFINER bypasses RLS so it won't cause infinite recursion
-- when used inside a profiles policy.
CREATE OR REPLACE FUNCTION public.is_coach()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'coach'
  );
$$;

-- Allow coaches to read all profiles (drop + recreate to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view own profile or coaches view all"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_coach());

-- Allow coaches to read all analyses
CREATE POLICY "Coaches can read all analyses"
  ON public.analyses FOR SELECT
  USING (public.is_coach());
