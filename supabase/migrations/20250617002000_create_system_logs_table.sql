-- Migration for system_logs table with RLS policies
-- This handles creating the table, indexes, and security policies

-- Create system_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.system_logs (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  level text NOT NULL,
  message text NOT NULL,
  details text NULL,
  source text NULL,
  user_id uuid NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT system_logs_pkey PRIMARY KEY (id),
  CONSTRAINT system_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT system_logs_level_check CHECK (
    (
      level = ANY (
        ARRAY[
          'info'::text,
          'error'::text,
          'warn'::text,
          'debug'::text
        ]
      )
    )
  )
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS system_logs_user_id_idx ON public.system_logs USING btree (user_id);
CREATE INDEX IF NOT EXISTS system_logs_level_idx ON public.system_logs USING btree (level);
CREATE INDEX IF NOT EXISTS system_logs_created_at_idx ON public.system_logs USING btree (created_at);
CREATE INDEX IF NOT EXISTS system_logs_source_idx ON public.system_logs USING btree (source);

-- Add table comment
COMMENT ON TABLE public.system_logs IS 'Stores system-wide logs and error messages';

-- Enable Row Level Security
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent migrations)
DO $$
BEGIN
    -- Drop select policy for admins if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'system_logs' AND policyname = 'Admins can view system logs'
    ) THEN
        DROP POLICY "Admins can view system logs" ON public.system_logs;
    END IF;

    -- Drop insert policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'system_logs' AND policyname = 'Service role can insert logs'
    ) THEN
        DROP POLICY "Service role can insert logs" ON public.system_logs;
    END IF;
    
    -- Drop insert policy for authenticated if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'system_logs' AND policyname = 'Authenticated users can report errors'
    ) THEN
        DROP POLICY "Authenticated users can report errors" ON public.system_logs;
    END IF;

    -- Drop update policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'system_logs' AND policyname = 'No one can update logs'
    ) THEN
        DROP POLICY "No one can update logs" ON public.system_logs;
    END IF;
    
    -- Drop delete policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'system_logs' AND policyname = 'Admins can clean up old logs'
    ) THEN
        DROP POLICY "Admins can clean up old logs" ON public.system_logs;
    END IF;
END
$$;

-- Create policies

-- Only admins can view system logs
CREATE POLICY "Admins can view system logs" 
ON public.system_logs 
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

-- Service role can insert logs (for system processes)
CREATE POLICY "Service role can insert logs" 
ON public.system_logs 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- Authenticated users can report errors (but only with their own user_id)
CREATE POLICY "Authenticated users can report errors" 
ON public.system_logs 
FOR INSERT 
WITH CHECK (
  auth.role() = 'authenticated' AND 
  (user_id IS NULL OR user_id = auth.uid())
);

-- No one can update logs (immutable audit trail)
CREATE POLICY "No one can update logs" 
ON public.system_logs 
FOR UPDATE 
USING (false);

-- Only admins can delete logs (for cleanup)
CREATE POLICY "Admins can clean up old logs" 
ON public.system_logs 
FOR DELETE 
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

-- Grant appropriate privileges
GRANT SELECT, DELETE ON public.system_logs TO authenticated;
GRANT INSERT ON public.system_logs TO anon, authenticated;
GRANT ALL ON public.system_logs TO service_role;

-- Create helper functions for logging

-- Function to log system message
CREATE OR REPLACE FUNCTION public.log_system_message(
  p_level text,
  p_message text,
  p_details text DEFAULT NULL,
  p_source text DEFAULT NULL,
  p_user_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_log_id uuid;
BEGIN
  -- Validate log level
  IF p_level NOT IN ('info', 'error', 'warn', 'debug') THEN
    p_level := 'info'; -- Default to info for invalid levels
  END IF;

  -- Insert log entry
  INSERT INTO public.system_logs (
    level,
    message,
    details,
    source,
    user_id
  ) VALUES (
    p_level,
    p_message,
    p_details,
    p_source,
    p_user_id
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Convenience functions for different log levels
CREATE OR REPLACE FUNCTION public.log_info(
  p_message text,
  p_details text DEFAULT NULL,
  p_source text DEFAULT NULL,
  p_user_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
BEGIN
  RETURN public.log_system_message('info', p_message, p_details, p_source, p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.log_error(
  p_message text,
  p_details text DEFAULT NULL,
  p_source text DEFAULT NULL,
  p_user_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
BEGIN
  RETURN public.log_system_message('error', p_message, p_details, p_source, p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.log_warning(
  p_message text,
  p_details text DEFAULT NULL,
  p_source text DEFAULT NULL,
  p_user_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
BEGIN
  RETURN public.log_system_message('warn', p_message, p_details, p_source, p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.log_debug(
  p_message text,
  p_details text DEFAULT NULL,
  p_source text DEFAULT NULL,
  p_user_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
BEGIN
  RETURN public.log_system_message('debug', p_message, p_details, p_source, p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old logs
CREATE OR REPLACE FUNCTION public.cleanup_old_logs(
  p_days_to_keep integer DEFAULT 30,
  p_keep_errors boolean DEFAULT true
)
RETURNS integer AS $$
DECLARE
  v_deleted_count integer;
  v_is_admin boolean;
BEGIN
  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND (role = 'admin' OR role LIKE '%admin%')
  ) OR EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE id = auth.uid()
    AND school_role = 'admin'
  ) INTO v_is_admin;
  
  -- Only proceed if user is admin
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only administrators can clean up logs';
  END IF;
  
  -- Delete old logs but keep errors if specified
  WITH deleted AS (
    DELETE FROM public.system_logs
    WHERE created_at < (now() - (p_days_to_keep || ' days')::interval)
    AND (NOT p_keep_errors OR level != 'error')
    RETURNING *
  )
  SELECT COUNT(*) FROM deleted INTO v_deleted_count;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
