-- Admin functionality migration
-- This script adds necessary tables and functions for admin features

-- Create user_roles table to manage admin and other roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'moderator', 'user')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS user_roles_user_id_idx ON public.user_roles(user_id);

-- Create site_config table for storing site-wide settings
CREATE TABLE IF NOT EXISTS public.site_config (
  id TEXT PRIMARY KEY,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default site settings
INSERT INTO public.site_config (id, config)
VALUES 
  ('general', '{"site_name": "EduBridge", "site_description": "Interactive educational platform"}'::jsonb),
  ('gamification', '{"base_xp": 10, "correct_answer_xp": 5, "level_threshold": 100}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Create admin_logs table to track administrative actions
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on admin_id for faster lookups
CREATE INDEX IF NOT EXISTS admin_logs_admin_id_idx ON public.admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS admin_logs_created_at_idx ON public.admin_logs(created_at DESC);

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  admin_id UUID,
  action TEXT,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.admin_logs (admin_id, action, entity_type, entity_id, details)
  VALUES (admin_id, action, entity_type, entity_id, details)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS policies for admin tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Policies for user_roles
CREATE POLICY "Allow admins to read all user roles" 
  ON public.user_roles FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Allow admins to insert user roles" 
  ON public.user_roles FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Allow admins to update user roles" 
  ON public.user_roles FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Policies for site_config
CREATE POLICY "Allow everyone to read site config" 
  ON public.site_config FOR SELECT 
  USING (true);

CREATE POLICY "Allow admins to update site config" 
  ON public.site_config FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Policies for admin_logs
CREATE POLICY "Allow admins to read admin logs" 
  ON public.admin_logs FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Allow admins to insert admin logs" 
  ON public.admin_logs FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));
