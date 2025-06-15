import { supabase } from './supabase';
import { logger } from './logger';

/**
 * Checks if the current user has admin permissions
 * @returns Object containing authorization status and user ID
 */
export async function checkAdminPermission(): Promise<{
  isAuthorized: boolean;
  userId: string | null;
  role?: string;
}> {
  try {
    // Get current session
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
      logger.error('Error getting session:', sessionError);
      return { isAuthorized: false, userId: null };
    }

    const userId = sessionData.session.user.id;

    // Check user roles (from user_roles table)
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (roleError) {
      // If there's no role entry, the user is definitely not an admin
      return { isAuthorized: false, userId };
    }

    // Check if the role is admin
    const role = (roleData?.role || '').toLowerCase();
    const isAdmin = role === 'admin' || role.includes('admin');

    // Alternatively, check school_role from user_profiles (for teacher/admin)
    if (!isAdmin) {
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('school_role')
        .eq('id', userId)
        .single();

      const schoolRole = (profileData?.school_role || '').toLowerCase();
      const isTeacher = schoolRole === 'teacher' || schoolRole === 'admin';

      if (isTeacher) {
        return { isAuthorized: true, userId, role: schoolRole };
      }
    }

    return {
      isAuthorized: isAdmin,
      userId,
      role: isAdmin ? 'admin' : undefined,
    };
  } catch (error) {
    logger.error('Error checking admin permission:', error);
    return { isAuthorized: false, userId: null };
  }
}
