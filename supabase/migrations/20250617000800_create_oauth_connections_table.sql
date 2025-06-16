-- Migration for oauth_connections table with RLS policies
-- This handles creating the table, indexes, and security policies

-- First, ensure the update_updated_at_column function exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create oauth_connections table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.oauth_connections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider text NOT NULL,
  provider_user_id text NOT NULL,
  access_token_encrypted text NULL,
  refresh_token_encrypted text NULL,
  token_expires_at timestamp with time zone NULL,
  provider_data jsonb NULL DEFAULT '{}'::jsonb,
  is_primary boolean NULL DEFAULT false,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT oauth_connections_pkey PRIMARY KEY (id),
  CONSTRAINT oauth_connections_provider_provider_user_id_key UNIQUE (provider, provider_user_id),
  CONSTRAINT oauth_connections_user_id_provider_key UNIQUE (user_id, provider),
  CONSTRAINT oauth_connections_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_oauth_connections_user_id ON public.oauth_connections USING btree (user_id);

-- Add table comment
COMMENT ON TABLE public.oauth_connections IS 'Stores OAuth provider connections for users';

-- Create trigger for automatically updating updated_at timestamp
DROP TRIGGER IF EXISTS update_oauth_connections_updated_at ON public.oauth_connections;
CREATE TRIGGER update_oauth_connections_updated_at 
BEFORE UPDATE ON public.oauth_connections 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.oauth_connections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent migrations)
DO $$
BEGIN
    -- Drop select policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'oauth_connections' AND policyname = 'Users can view their own OAuth connections'
    ) THEN
        DROP POLICY "Users can view their own OAuth connections" ON public.oauth_connections;
    END IF;

    -- Drop select policy for admins if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'oauth_connections' AND policyname = 'Admins can view all OAuth connections'
    ) THEN
        DROP POLICY "Admins can view all OAuth connections" ON public.oauth_connections;
    END IF;

    -- Drop insert policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'oauth_connections' AND policyname = 'Users can insert their own OAuth connections'
    ) THEN
        DROP POLICY "Users can insert their own OAuth connections" ON public.oauth_connections;
    END IF;
    
    -- Drop update policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'oauth_connections' AND policyname = 'Users can update their own OAuth connections'
    ) THEN
        DROP POLICY "Users can update their own OAuth connections" ON public.oauth_connections;
    END IF;
    
    -- Drop delete policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'oauth_connections' AND policyname = 'Users can delete their own OAuth connections'
    ) THEN
        DROP POLICY "Users can delete their own OAuth connections" ON public.oauth_connections;
    END IF;
END
$$;

-- Create policies
-- Users can view only their own OAuth connections
CREATE POLICY "Users can view their own OAuth connections" 
ON public.oauth_connections 
FOR SELECT 
USING (user_id = auth.uid());

-- Admins can view all OAuth connections
CREATE POLICY "Admins can view all OAuth connections" 
ON public.oauth_connections 
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

-- Users can insert their own OAuth connections
CREATE POLICY "Users can insert their own OAuth connections" 
ON public.oauth_connections 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Users can update their own OAuth connections
CREATE POLICY "Users can update their own OAuth connections" 
ON public.oauth_connections 
FOR UPDATE 
USING (user_id = auth.uid());

-- Users can delete their own OAuth connections
CREATE POLICY "Users can delete their own OAuth connections" 
ON public.oauth_connections 
FOR DELETE 
USING (user_id = auth.uid());

-- Grant appropriate privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON public.oauth_connections TO authenticated;
GRANT ALL ON public.oauth_connections TO service_role;

-- Create helper function for securely adding OAuth connections
CREATE OR REPLACE FUNCTION public.add_oauth_connection(
  p_user_id UUID,
  p_provider TEXT,
  p_provider_user_id TEXT,
  p_access_token TEXT,
  p_refresh_token TEXT DEFAULT NULL,
  p_token_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_provider_data JSONB DEFAULT '{}'::jsonb,
  p_is_primary BOOLEAN DEFAULT false
)
RETURNS UUID AS $$
DECLARE
  v_connection_id UUID;
  v_access_token_encrypted TEXT;
  v_refresh_token_encrypted TEXT;
BEGIN
  -- Simple encryption (in production, use more secure methods)
  -- This is just a placeholder - in real implementation use proper encryption
  v_access_token_encrypted = encode(encrypt(convert_to(p_access_token, 'utf8'), current_setting('app.encryption_key'), 'aes'), 'hex');
  
  IF p_refresh_token IS NOT NULL THEN
    v_refresh_token_encrypted = encode(encrypt(convert_to(p_refresh_token, 'utf8'), current_setting('app.encryption_key'), 'aes'), 'hex');
  END IF;

  -- Insert new connection or update existing one
  INSERT INTO public.oauth_connections (
    user_id,
    provider,
    provider_user_id,
    access_token_encrypted,
    refresh_token_encrypted,
    token_expires_at,
    provider_data,
    is_primary
  ) VALUES (
    p_user_id,
    p_provider,
    p_provider_user_id,
    v_access_token_encrypted,
    v_refresh_token_encrypted,
    p_token_expires_at,
    p_provider_data,
    p_is_primary
  )
  ON CONFLICT (user_id, provider)
  DO UPDATE SET
    access_token_encrypted = v_access_token_encrypted,
    refresh_token_encrypted = COALESCE(v_refresh_token_encrypted, oauth_connections.refresh_token_encrypted),
    token_expires_at = COALESCE(p_token_expires_at, oauth_connections.token_expires_at),
    provider_data = COALESCE(p_provider_data, oauth_connections.provider_data),
    is_primary = COALESCE(p_is_primary, oauth_connections.is_primary),
    updated_at = now()
  RETURNING id INTO v_connection_id;
  
  RETURN v_connection_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
