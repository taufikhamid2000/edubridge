-- Comprehensive fix for the admin role issues

-- STEP 1: Fix table permissions
-- Allow anyone to read from user_roles (still protected by RLS)
GRANT SELECT ON public.user_roles TO PUBLIC;
GRANT USAGE ON SCHEMA public TO PUBLIC;

-- STEP 2: Remove problematic RLS policies that cause recursion
DROP POLICY IF EXISTS "Allow admins to read all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow admins to insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow admins to update user roles" ON public.user_roles;

-- STEP 3: Disable RLS temporarily to make changes
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- STEP 4: Fix any broken role values
UPDATE public.user_roles
SET role = 'admin'
WHERE role LIKE '%admin%' AND role != 'admin';

-- STEP 5: Check and fix constraint on role column
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_role_check
CHECK (role IN ('admin', 'moderator', 'user'));

-- STEP 6: Ensure the service role can always access the table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "User roles service access" ON public.user_roles;
CREATE POLICY "User roles service access" ON public.user_roles
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- STEP 7: Create a simple policy for users to read their own role
DROP POLICY IF EXISTS "Allow users to read their own role" ON public.user_roles;
CREATE POLICY "Allow users to read their own role" 
  ON public.user_roles FOR SELECT 
  USING (user_id = auth.uid());

-- STEP 8: Create a fixed version of the count_admins function
CREATE OR REPLACE FUNCTION public.count_admins()
RETURNS integer AS $$
DECLARE
  admin_count integer;
BEGIN
  -- Access using service_role, bypassing RLS
  SELECT COUNT(*) INTO admin_count
  FROM public.user_roles
  WHERE role = 'admin';
  
  RETURN admin_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.count_admins() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.count_admins() TO authenticated;
GRANT EXECUTE ON FUNCTION public.count_admins() TO service_role;

-- STEP 9: Diagnostic query to check your roles
SELECT tablename, policyname, permissive, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_roles' AND schemaname = 'public';
