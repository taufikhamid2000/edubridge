-- Create a function to count admin users
-- This can be used to test if the admin client has appropriate permissions

-- Function to count admin users
CREATE OR REPLACE FUNCTION count_admins()
RETURNS integer AS $$
DECLARE
  admin_count integer;
BEGIN
  SELECT COUNT(*) INTO admin_count
  FROM public.user_roles
  WHERE role = 'admin';
  
  RETURN admin_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION count_admins() TO service_role;
