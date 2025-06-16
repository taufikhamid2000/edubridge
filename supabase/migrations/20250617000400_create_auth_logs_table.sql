-- Migration for auth_logs table with RLS policies
-- This handles creating the table, indexes, and security policies

-- Create auth_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.auth_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  event_type text NOT NULL,
  event_data jsonb NULL DEFAULT '{}'::jsonb,
  ip_address text NULL,
  user_agent text NULL,
  success boolean NULL DEFAULT true,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT auth_logs_pkey PRIMARY KEY (id),
  CONSTRAINT auth_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_auth_logs_user_id ON public.auth_logs USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_auth_logs_event_type ON public.auth_logs USING btree (event_type);
CREATE INDEX IF NOT EXISTS idx_auth_logs_created_at ON public.auth_logs USING btree (created_at);

-- Add table comment
COMMENT ON TABLE public.auth_logs IS 'Stores authentication events for security monitoring';

-- Enable Row Level Security
ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent migrations)
DO $$
BEGIN
    -- Drop select policy for users if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'auth_logs' AND policyname = 'Users can view their own auth logs'
    ) THEN
        DROP POLICY "Users can view their own auth logs" ON public.auth_logs;
    END IF;

    -- Drop select policy for admins if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'auth_logs' AND policyname = 'Admins can view all auth logs'
    ) THEN
        DROP POLICY "Admins can view all auth logs" ON public.auth_logs;
    END IF;

    -- Drop insert policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'auth_logs' AND policyname = 'Allow service role to insert auth logs'
    ) THEN
        DROP POLICY "Allow service role to insert auth logs" ON public.auth_logs;
    END IF;
    
    -- Drop update policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'auth_logs' AND policyname = 'No one can update auth logs'
    ) THEN
        DROP POLICY "No one can update auth logs" ON public.auth_logs;
    END IF;
    
    -- Drop delete policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'auth_logs' AND policyname = 'Only admins can delete auth logs'
    ) THEN
        DROP POLICY "Only admins can delete auth logs" ON public.auth_logs;
    END IF;
END
$$;

-- Create policies
-- Users can view only their own auth logs
CREATE POLICY "Users can view their own auth logs" 
ON public.auth_logs 
FOR SELECT 
USING (
  auth.uid() = user_id
);

-- Admins can view all auth logs
CREATE POLICY "Admins can view all auth logs" 
ON public.auth_logs 
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

-- Only the system can insert auth logs (effectively preventing direct user inserts)
CREATE POLICY "Allow service role to insert auth logs" 
ON public.auth_logs 
FOR INSERT 
WITH CHECK (false); -- Only the service role can insert (bypassing RLS)

-- No one can update auth logs (immutable audit trail)
CREATE POLICY "No one can update auth logs" 
ON public.auth_logs 
FOR UPDATE 
USING (false);

-- Only admins can delete auth logs (for retention policies or legal requirements)
CREATE POLICY "Only admins can delete auth logs" 
ON public.auth_logs 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Grant appropriate privileges
GRANT SELECT ON public.auth_logs TO authenticated;
GRANT DELETE ON public.auth_logs TO authenticated; -- RLS will limit this to admins only
GRANT ALL ON public.auth_logs TO service_role;

-- Create function for logging auth events (to be called from server-side)
CREATE OR REPLACE FUNCTION public.log_auth_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_event_data JSONB DEFAULT '{}'::jsonb,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT TRUE
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.auth_logs (
    user_id,
    event_type,
    event_data,
    ip_address,
    user_agent,
    success,
    created_at
  ) VALUES (
    p_user_id,
    p_event_type,
    p_event_data,
    p_ip_address,
    p_user_agent,
    p_success,
    now()
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
