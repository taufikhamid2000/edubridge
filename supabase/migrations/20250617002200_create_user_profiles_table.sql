-- Migration for user_profiles table with RLS policies
-- This handles creating the table, indexes, and security policies

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid NOT NULL,
  display_name text NULL,
  avatar_url text NULL,
  xp integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  streak integer NOT NULL DEFAULT 0,
  daily_xp integer NOT NULL DEFAULT 0,
  weekly_xp integer NOT NULL DEFAULT 0,
  last_quiz_date timestamp with time zone NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_disabled boolean NOT NULL DEFAULT false,
  school_id uuid NULL,
  school_role text NULL,
  is_school_visible boolean NULL DEFAULT false,
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT user_profiles_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id),
  CONSTRAINT user_profiles_school_role_check CHECK (
    (
      school_role = ANY (
        ARRAY['student'::text, 'teacher'::text, 'admin'::text]
      )
    )
  )
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS user_profiles_xp_idx ON public.user_profiles USING btree (xp DESC);
CREATE INDEX IF NOT EXISTS user_profiles_daily_xp_idx ON public.user_profiles USING btree (daily_xp DESC);
CREATE INDEX IF NOT EXISTS user_profiles_weekly_xp_idx ON public.user_profiles USING btree (weekly_xp DESC);
CREATE INDEX IF NOT EXISTS user_profiles_last_quiz_date_idx ON public.user_profiles USING btree (last_quiz_date);
CREATE INDEX IF NOT EXISTS user_profiles_is_disabled_idx ON public.user_profiles USING btree (is_disabled);
CREATE INDEX IF NOT EXISTS idx_user_profiles_dashboard ON public.user_profiles USING btree (id, last_quiz_date) 
WHERE (school_role = 'student'::text);
CREATE INDEX IF NOT EXISTS user_profiles_school_id_idx ON public.user_profiles USING btree (school_id);
CREATE INDEX IF NOT EXISTS user_profiles_school_role_idx ON public.user_profiles USING btree (school_role);

-- Create trigger function for updated_at if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'handle_updated_at'
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    CREATE OR REPLACE FUNCTION public.handle_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  END IF;
END
$$;

-- Create trigger to update updated_at automatically
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'set_user_profiles_updated_at'
    AND tgrelid = 'public.user_profiles'::regclass
  ) THEN
    CREATE TRIGGER set_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END
$$;

-- Add table comment
COMMENT ON TABLE public.user_profiles IS 'Stores extended user information and statistics';

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent migrations)
DO $$
BEGIN
    -- Drop select policy for users if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' AND policyname = 'Users can view their own profile'
    ) THEN
        DROP POLICY "Users can view their own profile" ON public.user_profiles;
    END IF;

    -- Drop select policy for leaderboard if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' AND policyname = 'Users can view non-disabled profiles for leaderboards'
    ) THEN
        DROP POLICY "Users can view non-disabled profiles for leaderboards" ON public.user_profiles;
    END IF;

    -- Drop select policy for school admins if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' AND policyname = 'School admins can view their school users'
    ) THEN
        DROP POLICY "School admins can view their school users" ON public.user_profiles;
    END IF;

    -- Drop select policy for admins if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' AND policyname = 'Admins can view all profiles'
    ) THEN
        DROP POLICY "Admins can view all profiles" ON public.user_profiles;
    END IF;

    -- Drop insert policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' AND policyname = 'Users can insert their own profile'
    ) THEN
        DROP POLICY "Users can insert their own profile" ON public.user_profiles;
    END IF;
    
    -- Drop update policy for users if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' AND policyname = 'Users can update their own basic profile'
    ) THEN
        DROP POLICY "Users can update their own basic profile" ON public.user_profiles;
    END IF;
    
    -- Drop update policy for system if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' AND policyname = 'Service role can update any profile'
    ) THEN
        DROP POLICY "Service role can update any profile" ON public.user_profiles;
    END IF;

    -- Drop update policy for admins if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' AND policyname = 'Admins can update any profile'
    ) THEN
        DROP POLICY "Admins can update any profile" ON public.user_profiles;
    END IF;
    
    -- Drop delete policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' AND policyname = 'No manual deletion of profiles'
    ) THEN
        DROP POLICY "No manual deletion of profiles" ON public.user_profiles;
    END IF;
END
$$;

-- Create policies

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (id = auth.uid());

-- Allow users to view non-disabled profiles for leaderboards
CREATE POLICY "Users can view non-disabled profiles for leaderboards" 
ON public.user_profiles 
FOR SELECT 
USING (
  is_disabled = false AND
  (
    is_school_visible = true OR
    school_id IS NULL OR
    school_role != 'student'
  )
);

-- School admins/teachers can view their school users
CREATE POLICY "School admins can view their school users" 
ON public.user_profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM public.user_profiles up
    WHERE up.id = auth.uid()
    AND up.school_id = user_profiles.school_id
    AND up.school_role IN ('admin', 'teacher')
  )
);

-- Global admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.user_profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND (role = 'admin' OR role LIKE '%admin%')
  )
);

-- Users can insert their own profile (one time only)
CREATE POLICY "Users can insert their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (id = auth.uid());

-- Users can update limited fields in their own profile
CREATE POLICY "Users can update their own basic profile" 
ON public.user_profiles 
FOR UPDATE 
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid() AND
  -- Prevent users from updating these sensitive fields
  xp IS NOT DISTINCT FROM OLD.xp AND
  level IS NOT DISTINCT FROM OLD.level AND
  streak IS NOT DISTINCT FROM OLD.streak AND
  daily_xp IS NOT DISTINCT FROM OLD.daily_xp AND
  weekly_xp IS NOT DISTINCT FROM OLD.weekly_xp AND
  is_disabled IS NOT DISTINCT FROM OLD.is_disabled AND
  school_role IS NOT DISTINCT FROM OLD.school_role
);

-- Allow service role to update any profile (for system functions)
CREATE POLICY "Service role can update any profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Allow admins to update any profile
CREATE POLICY "Admins can update any profile" 
ON public.user_profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND (role = 'admin' OR role LIKE '%admin%')
  )
  OR EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE id = auth.uid()
    AND school_role = 'admin'
  )
);

-- Profiles are only deleted through cascading from auth.users
CREATE POLICY "No manual deletion of profiles" 
ON public.user_profiles 
FOR DELETE 
USING (false);

-- Grant appropriate privileges
GRANT SELECT ON public.user_profiles TO authenticated;
GRANT INSERT, UPDATE ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;

-- Create helper functions

-- Create or replace function for creating profiles automatically
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'on_auth_user_created'
    AND tgrelid = 'auth.users'::regclass
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
  END IF;
END
$$;

-- Function to increment XP for a user
CREATE OR REPLACE FUNCTION public.add_user_xp(
  p_user_id uuid,
  p_xp_amount integer
)
RETURNS boolean AS $$
DECLARE
  v_current_xp integer;
  v_new_xp integer;
  v_current_level integer;
  v_new_level integer;
  v_xp_for_next_level integer;
BEGIN
  -- Get current values
  SELECT xp, level
  INTO v_current_xp, v_current_level
  FROM public.user_profiles
  WHERE id = p_user_id;
  
  -- Calculate new XP and level
  v_new_xp := v_current_xp + p_xp_amount;
  
  -- Simple level calculation (100 XP per level)
  v_new_level := 1 + (v_new_xp / 100);
  
  -- Update profile
  UPDATE public.user_profiles
  SET 
    xp = v_new_xp,
    level = v_new_level,
    daily_xp = daily_xp + p_xp_amount,
    weekly_xp = weekly_xp + p_xp_amount,
    last_quiz_date = now()
  WHERE id = p_user_id;
  
  -- Check for streak update (if last quiz was yesterday or earlier today)
  UPDATE public.user_profiles
  SET streak = streak + 1
  WHERE id = p_user_id
  AND (
    last_quiz_date IS NULL OR
    (last_quiz_date < date_trunc('day', now()) AND last_quiz_date >= date_trunc('day', now()) - interval '1 day')
  );
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset daily/weekly XP (for scheduled jobs)
CREATE OR REPLACE FUNCTION public.reset_xp_counters(reset_type text)
RETURNS integer AS $$
DECLARE
  v_updated_count integer;
BEGIN
  IF reset_type = 'daily' THEN
    UPDATE public.user_profiles
    SET daily_xp = 0
    WHERE daily_xp > 0
    RETURNING COUNT(*) INTO v_updated_count;
  ELSIF reset_type = 'weekly' THEN
    UPDATE public.user_profiles
    SET weekly_xp = 0
    WHERE weekly_xp > 0
    RETURNING COUNT(*) INTO v_updated_count;
  ELSE
    RAISE EXCEPTION 'Invalid reset_type: must be "daily" or "weekly"';
  END IF;
  
  RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset streaks for inactive users
CREATE OR REPLACE FUNCTION public.reset_inactive_streaks()
RETURNS integer AS $$
DECLARE
  v_updated_count integer;
BEGIN
  UPDATE public.user_profiles
  SET streak = 0
  WHERE streak > 0
  AND (
    last_quiz_date IS NULL OR
    last_quiz_date < (date_trunc('day', now()) - interval '1 day')
  )
  RETURNING COUNT(*) INTO v_updated_count;
  
  RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
