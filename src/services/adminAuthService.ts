import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

/**
 * Verifies if the current user has admin privileges
 * @returns Object containing admin status and any error message
 */
export async function verifyAdminAccess(): Promise<{
  isAdmin: boolean;
  userId?: string;
  error: Error | null;
}> {
  try {
    // Get the current session first
    const sessionResponse = await supabase.auth.getSession();
    const session = sessionResponse.data.session;
    const userId = session?.user?.id;

    // Log session state for debugging
    // console.log('Session check:', {
    //   hasSession: !!session,
    //   hasUserId: !!userId,
    //   timestamp: new Date().toISOString(),
    // });

    if (!userId) {
      logger.error('Admin access denied - no authenticated user');
      return {
        isAdmin: false,
        error: new Error('Authentication required - please login'),
      };
    }

    // Check if the user is an admin via a direct query
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    // Debug role check
    // console.log('User role check:', {
    //   userId,
    //   hasRoleData: !!userRoles,
    //   role: userRoles?.role,
    //   hasError: !!roleError,
    // });

    if (roleError) {
      logger.error('Error checking admin role:', roleError);
      return {
        isAdmin: false,
        userId,
        error: new Error(`Role check failed: ${roleError.message}`),
      };
    }

    if (!userRoles || userRoles.role !== 'admin') {
      logger.error('Admin access denied - user is not an admin', {
        role: userRoles?.role,
      });
      return {
        isAdmin: false,
        userId,
        error: new Error('Admin access required'),
      };
    }

    // User is confirmed as admin
    return { isAdmin: true, userId, error: null };
  } catch (error) {
    const err =
      error instanceof Error
        ? error
        : new Error(
            error && typeof error === 'object'
              ? JSON.stringify(error)
              : 'Unknown error verifying admin access'
          );

    logger.error('Error in verifyAdminAccess:', err);
    console.error('Full error details:', error);
    return { isAdmin: false, error: err };
  }
}

/**
 * A simplified version of the admin check for use in CRUD operations
 */
export async function checkAdminAccess(): Promise<{
  success: boolean;
  error: Error | null;
}> {
  const { isAdmin, error } = await verifyAdminAccess();
  return { success: isAdmin, error };
}
