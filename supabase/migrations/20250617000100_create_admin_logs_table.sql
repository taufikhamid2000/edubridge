-- Migration for admin_logs table with RLS policies
-- This handles creating the table, indexes, and security policies

-- Create admin_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  admin_id uuid NOT NULL,
  action text NOT NULL,
  entity_type text NULL,
  entity_id text NULL,
  details jsonb NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT admin_logs_pkey PRIMARY KEY (id),
  CONSTRAINT admin_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS admin_logs_admin_id_idx ON public.admin_logs USING btree (admin_id);
CREATE INDEX IF NOT EXISTS admin_logs_created_at_idx ON public.admin_logs USING btree (created_at);

-- Add table comment
COMMENT ON TABLE public.admin_logs IS 'Stores administrative action logs for audit purposes';

-- Enable Row Level Security
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent migrations)
DO $$
BEGIN
    -- Drop select policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'admin_logs' AND policyname = 'Only admins can view admin logs'
    ) THEN
        DROP POLICY "Only admins can view admin logs" ON public.admin_logs;
    END IF;

    -- Drop insert policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'admin_logs' AND policyname = 'Only admins can insert logs'
    ) THEN
        DROP POLICY "Only admins can insert logs" ON public.admin_logs;
    END IF;
    
    -- Drop update policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'admin_logs' AND policyname = 'No one can update admin logs'
    ) THEN
        DROP POLICY "No one can update admin logs" ON public.admin_logs;
    END IF;
    
    -- Drop delete policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'admin_logs' AND policyname = 'No one can delete admin logs'
    ) THEN
        DROP POLICY "No one can delete admin logs" ON public.admin_logs;
    END IF;
END
$$;

-- Create policies
-- Allow admins to view all logs (based on user_roles table)
CREATE POLICY "Only admins can view admin logs" 
ON public.admin_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND (role = 'admin' OR role LIKE '%admin%')
  )
);

-- Allow admins to insert logs (based on user_roles table)
CREATE POLICY "Only admins can insert logs" 
ON public.admin_logs 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND (role = 'admin' OR role LIKE '%admin%')
  )
);

-- Prevent anyone from updating logs (immutable audit trail)
CREATE POLICY "No one can update admin logs" 
ON public.admin_logs 
FOR UPDATE 
USING (false);

-- Prevent anyone from deleting logs (immutable audit trail)
CREATE POLICY "No one can delete admin logs" 
ON public.admin_logs 
FOR DELETE 
USING (false);

-- Grant appropriate privileges
GRANT SELECT, INSERT ON public.admin_logs TO authenticated;
GRANT ALL ON public.admin_logs TO service_role;
