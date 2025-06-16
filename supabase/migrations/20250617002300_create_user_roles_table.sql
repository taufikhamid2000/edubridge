-- Migration for user_roles table with RLS policies
-- This handles creating the table, indexes, and security policies

-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL,
  role text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_roles_pkey PRIMARY KEY (id),
  CONSTRAINT user_roles_user_id_key UNIQUE (user_id),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT user_roles_role_check CHECK (
    (
      role = ANY (
        ARRAY['user'::text, 'moderator'::text, 'admin'::text]
      )
    )
  )
);

-- Create indexes for faster lookups (note: we're using only one index for user_id since it's already a unique constraint)
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles USING btree (role);
CREATE INDEX IF NOT EXISTS idx_user_roles_created_at ON public.user_roles USING btree (created_at);

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
    WHERE tgname = 'set_user_roles_updated_at'
    AND tgrelid = 'public.user_roles'::regclass
  ) THEN
    CREATE TRIGGER set_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END
$$;

-- Add table comment
COMMENT ON TABLE public.user_roles IS 'Stores platform-wide user role assignments';

-- Enable Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent migrations)
DO $$
BEGIN
    -- Drop select policy for users if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_roles' AND policyname = 'Users can view their own role'
    ) THEN
        DROP POLICY "Users can view their own role" ON public.user_roles;
    END IF;

    -- Drop select policy for admins if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_roles' AND policyname = 'Admins can view all roles'
    ) THEN
        DROP POLICY "Admins can view all roles" ON public.user_roles;
    END IF;

    -- Drop insert policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_roles' AND policyname = 'Only admins can assign roles'
    ) THEN
        DROP POLICY "Only admins can assign roles" ON public.user_roles;
    END IF;
    
    -- Drop update policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_roles' AND policyname = 'Only admins can update roles'
    ) THEN
        DROP POLICY "Only admins can update roles" ON public.user_roles;
    END IF;
    
    -- Drop delete policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_roles' AND policyname = 'Only super admins can delete roles'
    ) THEN
        DROP POLICY "Only super admins can delete roles" ON public.user_roles;
    END IF;
END
$$;

-- Create policies

-- Allow users to view their own role
CREATE POLICY "Users can view their own role" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

-- Allow admins to view all roles
CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Only admins can assign roles
CREATE POLICY "Only admins can assign roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Only admins can update roles
CREATE POLICY "Only admins can update roles" 
ON public.user_roles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Only super admins can delete roles (implemented via a function check)
CREATE POLICY "Only super admins can delete roles" 
ON public.user_roles 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
  AND public.is_super_admin(auth.uid())
);

-- Grant appropriate privileges
GRANT SELECT ON public.user_roles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- Create helper functions

-- Function to check if a user is a super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT count(*) > 0
    FROM public.site_config
    WHERE id = 'super_admins'
    AND config->>'user_ids' ? p_user_id::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- Function to check if a specific user is an admin
CREATE OR REPLACE FUNCTION public.is_user_admin(p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = p_user_id 
    AND role = 'admin'
  )
  OR EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE id = p_user_id
    AND school_role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- Function to assign a role to a user
CREATE OR REPLACE FUNCTION public.assign_user_role(
  p_user_id uuid,
  p_role text
)
RETURNS uuid AS $$
DECLARE
  v_current_user_is_admin boolean;
  v_role_id uuid;
BEGIN
  -- Check if current user is an admin
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  ) INTO v_current_user_is_admin;
  
  -- Only proceed if current user is an admin
  IF NOT v_current_user_is_admin THEN
    RAISE EXCEPTION 'Only administrators can assign roles';
  END IF;
  
  -- Validate the role value
  IF p_role NOT IN ('user', 'moderator', 'admin') THEN
    RAISE EXCEPTION 'Invalid role: must be "user", "moderator", or "admin"';
  END IF;
  
  -- Check if trying to add another admin when not a super admin
  IF p_role = 'admin' AND NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only super admins can assign admin roles';
  END IF;

  -- Insert or update the user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, p_role)
  ON CONFLICT (user_id)
  DO UPDATE SET 
    role = p_role,
    updated_at = now()
  RETURNING id INTO v_role_id;
  
  -- Log the role assignment
  PERFORM public.log_info(
    'User role assigned', 
    format('User %s assigned role %s by %s', p_user_id, p_role, auth.uid()),
    'user_management',
    auth.uid()
  );
  
  RETURN v_role_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
