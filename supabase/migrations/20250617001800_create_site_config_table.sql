-- Migration for site_config table with RLS policies
-- This handles creating the table, indexes, and security policies

-- Create site_config table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.site_config (
  id text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT site_config_pkey PRIMARY KEY (id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_site_config_id ON public.site_config USING btree (id);
CREATE INDEX IF NOT EXISTS idx_site_config_created_at ON public.site_config USING btree (created_at);

-- Add table comment
COMMENT ON TABLE public.site_config IS 'Stores site-wide configuration settings';

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
    WHERE tgname = 'set_site_config_updated_at'
    AND tgrelid = 'public.site_config'::regclass
  ) THEN
    CREATE TRIGGER set_site_config_updated_at
    BEFORE UPDATE ON public.site_config
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END
$$;

-- Enable Row Level Security
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent migrations)
DO $$
BEGIN
    -- Drop select policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'site_config' AND policyname = 'Anyone can view public site config'
    ) THEN
        DROP POLICY "Anyone can view public site config" ON public.site_config;
    END IF;

    -- Drop select policy for admins if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'site_config' AND policyname = 'Admins can view all site config'
    ) THEN
        DROP POLICY "Admins can view all site config" ON public.site_config;
    END IF;

    -- Drop insert/update policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'site_config' AND policyname = 'Only admins can modify site config'
    ) THEN
        DROP POLICY "Only admins can modify site config" ON public.site_config;
    END IF;
    
    -- Drop delete policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'site_config' AND policyname = 'Only admins can delete site config'
    ) THEN
        DROP POLICY "Only admins can delete site config" ON public.site_config;
    END IF;
END
$$;

-- Create policies

-- Allow anyone to view public site config entries
CREATE POLICY "Anyone can view public site config" 
ON public.site_config 
FOR SELECT 
USING (
  id LIKE 'public_%' OR
  id LIKE 'global_%' OR
  id = 'features' OR
  id = 'app_settings'
);

-- Allow admins to view all site config
CREATE POLICY "Admins can view all site config" 
ON public.site_config 
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

-- Only admins can insert/update site config
CREATE POLICY "Only admins can modify site config" 
ON public.site_config 
FOR ALL 
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
)
WITH CHECK (
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
GRANT SELECT ON public.site_config TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_config TO authenticated;
GRANT ALL ON public.site_config TO service_role;

-- Create helper functions

-- Function to get site config by key
CREATE OR REPLACE FUNCTION public.get_site_config(config_id text)
RETURNS jsonb AS $$
DECLARE
  config_value jsonb;
BEGIN
  -- Check if requesting a restricted config and if user has access
  IF config_id LIKE 'admin_%' OR config_id LIKE 'internal_%' OR config_id LIKE 'restricted_%' THEN
    -- Check if user is admin
    IF NOT (
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
    ) THEN
      -- Return empty object if not admin
      RETURN '{}'::jsonb;
    END IF;
  END IF;
  
  -- Get config value
  SELECT config INTO config_value
  FROM public.site_config
  WHERE id = config_id;
  
  RETURN COALESCE(config_value, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- Function to set site config (admin only)
CREATE OR REPLACE FUNCTION public.set_site_config(
  config_id text, 
  config_value jsonb
)
RETURNS boolean AS $$
DECLARE
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
    RAISE EXCEPTION 'Only administrators can modify site configuration';
  END IF;

  -- Insert or update config
  INSERT INTO public.site_config (id, config, updated_at)
  VALUES (config_id, config_value, now())
  ON CONFLICT (id) 
  DO UPDATE SET 
    config = config_value,
    updated_at = now();
    
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add default config entries
INSERT INTO public.site_config (id, config)
VALUES 
  ('app_settings', '{"site_name": "EduBridge", "maintenance_mode": false, "version": "1.0.0"}'::jsonb),
  ('features', '{"quizzes": true, "leaderboard": true, "achievements": true, "dashboard": true}'::jsonb)
ON CONFLICT (id) DO NOTHING;
