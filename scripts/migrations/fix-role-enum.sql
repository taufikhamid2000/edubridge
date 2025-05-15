-- This script fixes potential issues with the role column in the user_roles table

-- First check if the constraint exists
DO $$
BEGIN
  -- Check and fix the constraint if needed
  IF EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'user_roles_role_check'
  ) THEN
    -- Drop the existing constraint
    ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
  END IF;

  -- Re-add the constraint with correct values
  ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_role_check 
  CHECK (role IN ('admin', 'moderator', 'user'));

  RAISE NOTICE 'Role constraint fixed or confirmed.';
END
$$;

-- Update any inconsistent roles to 'admin'
UPDATE public.user_roles
SET role = 'admin'
WHERE role LIKE '%admin%' AND role != 'admin';

-- Give public read access to user_roles for basic role checks
GRANT SELECT ON public.user_roles TO PUBLIC;

-- Verify RLS is properly configured
DO $$
BEGIN
  -- Make sure RLS is enabled
  ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
  
  -- Check for existing policies and create them if missing
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Allow users to read their own role'
  ) THEN
    CREATE POLICY "Allow users to read their own role" 
      ON public.user_roles FOR SELECT 
      USING (user_id = auth.uid());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Allow admins to read all user roles'
  ) THEN
    CREATE POLICY "Allow admins to read all user roles" 
      ON public.user_roles FOR SELECT 
      USING (EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
      ));
  END IF;

  RAISE NOTICE 'RLS policies checked and fixed if needed.';
END
$$;
