-- Migration for user_sessions table with RLS policies
-- This handles creating the table, indexes, and security policies

-- Create update_updated_at_column function if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'update_updated_at_column'
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    CREATE OR REPLACE FUNCTION public.update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  END IF;
END
$$;

-- Create user_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_sessions (
  user_id uuid NOT NULL,
  session_data jsonb NULL DEFAULT '{}'::jsonb,
  last_activity timestamp with time zone NULL DEFAULT now(),
  ip_address inet NULL,
  user_agent text NULL,
  is_active boolean NULL DEFAULT true,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT user_sessions_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON public.user_sessions USING btree (last_activity);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON public.user_sessions USING btree (is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_ip_address ON public.user_sessions USING btree (ip_address);
CREATE INDEX IF NOT EXISTS idx_user_sessions_created_at ON public.user_sessions USING btree (created_at);

-- Create trigger to update updated_at automatically
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_user_sessions_updated_at'
    AND tgrelid = 'public.user_sessions'::regclass
  ) THEN
    CREATE TRIGGER update_user_sessions_updated_at
    BEFORE UPDATE ON public.user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END
$$;

-- Add table comment
COMMENT ON TABLE public.user_sessions IS 'Stores user session information and activity tracking';

-- Enable Row Level Security
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent migrations)
DO $$
BEGIN
    -- Drop select policy for users if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_sessions' AND policyname = 'Users can view their own session'
    ) THEN
        DROP POLICY "Users can view their own session" ON public.user_sessions;
    END IF;

    -- Drop select policy for admins if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_sessions' AND policyname = 'Admins can view all sessions'
    ) THEN
        DROP POLICY "Admins can view all sessions" ON public.user_sessions;
    END IF;

    -- Drop insert/update policy for users if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_sessions' AND policyname = 'Users can manage their own session'
    ) THEN
        DROP POLICY "Users can manage their own session" ON public.user_sessions;
    END IF;
    
    -- Drop update policy for service role if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_sessions' AND policyname = 'Service role can manage all sessions'
    ) THEN
        DROP POLICY "Service role can manage all sessions" ON public.user_sessions;
    END IF;
    
    -- Drop delete policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_sessions' AND policyname = 'No manual deletion of sessions'
    ) THEN
        DROP POLICY "No manual deletion of sessions" ON public.user_sessions;
    END IF;
END
$$;

-- Create policies

-- Allow users to view their own session
CREATE POLICY "Users can view their own session" 
ON public.user_sessions 
FOR SELECT 
USING (user_id = auth.uid());

-- Allow admins to view all sessions
CREATE POLICY "Admins can view all sessions" 
ON public.user_sessions 
FOR SELECT 
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

-- Allow users to manage their own session
CREATE POLICY "Users can manage their own session" 
ON public.user_sessions 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Allow service role to manage all sessions
CREATE POLICY "Service role can manage all sessions" 
ON public.user_sessions 
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Grant appropriate privileges
GRANT SELECT, INSERT, UPDATE ON public.user_sessions TO authenticated;
GRANT ALL ON public.user_sessions TO service_role;

-- Create helper functions

-- Function to update user session activity
CREATE OR REPLACE FUNCTION public.update_session_activity(
  p_user_id uuid DEFAULT auth.uid(),
  p_ip_address inet DEFAULT null,
  p_user_agent text DEFAULT null
)
RETURNS boolean AS $$
DECLARE
  v_session_exists boolean;
BEGIN
  -- Check if a session exists for this user
  SELECT EXISTS (
    SELECT 1
    FROM public.user_sessions
    WHERE user_id = p_user_id
  ) INTO v_session_exists;
  
  -- Insert or update the session
  IF v_session_exists THEN
    -- Update existing session
    UPDATE public.user_sessions
    SET 
      last_activity = now(),
      ip_address = COALESCE(p_ip_address, ip_address),
      user_agent = COALESCE(p_user_agent, user_agent),
      is_active = true
    WHERE user_id = p_user_id;
  ELSE
    -- Create new session
    INSERT INTO public.user_sessions (
      user_id,
      ip_address,
      user_agent,
      is_active
    ) VALUES (
      p_user_id,
      p_ip_address,
      p_user_agent,
      true
    );
  END IF;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark a session as inactive
CREATE OR REPLACE FUNCTION public.end_user_session(
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS boolean AS $$
BEGIN
  -- Update session to inactive
  UPDATE public.user_sessions
  SET 
    is_active = false,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old inactive sessions
CREATE OR REPLACE FUNCTION public.cleanup_inactive_sessions(
  p_days_threshold integer DEFAULT 30
)
RETURNS integer AS $$
DECLARE
  v_deleted_count integer;
BEGIN
  -- Delete old inactive sessions
  WITH deleted AS (
    DELETE FROM public.user_sessions
    WHERE is_active = false
    AND last_activity < (now() - (p_days_threshold || ' days')::interval)
    RETURNING *
  )
  SELECT COUNT(*) FROM deleted INTO v_deleted_count;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Store user session data (arbitrary JSON)
CREATE OR REPLACE FUNCTION public.set_session_data(
  p_key text,
  p_value jsonb,
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS boolean AS $$
BEGIN
  -- Update session data for a specific key
  UPDATE public.user_sessions
  SET 
    session_data = jsonb_set(
      COALESCE(session_data, '{}'::jsonb),
      ARRAY[p_key],
      p_value
    ),
    last_activity = now()
  WHERE user_id = p_user_id;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user session data
CREATE OR REPLACE FUNCTION public.get_session_data(
  p_key text,
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS jsonb AS $$
DECLARE
  v_data jsonb;
BEGIN
  -- Get session data for a specific key
  SELECT session_data->p_key INTO v_data
  FROM public.user_sessions
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(v_data, 'null'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
