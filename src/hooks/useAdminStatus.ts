import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

/**
 * Hook to check if the current user has admin privileges
 * @returns Object with isAdmin status and loading state
 */
export function useAdminStatus() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get current session
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) {
          logger.error('Error getting session:', sessionError);
          setError('Failed to check authentication status');
          setIsAdmin(false);
          return;
        }

        if (!sessionData.session) {
          // No active session, user is not logged in
          setIsAdmin(false);
          return;
        }

        const userId = sessionData.session.user.id;

        // Check if user has admin role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .single();

        if (roleError) {
          if (roleError.code === 'PGRST116') {
            // No matching row found - user has no role assigned
            setIsAdmin(false);
          } else {
            logger.error('Error checking admin role:', roleError);
            setError('Failed to check admin status');
            setIsAdmin(false);
          }
          return;
        }

        // Check if role is admin
        const roleValue = (roleData?.role || '').toLowerCase();
        setIsAdmin(roleValue === 'admin' || roleValue.includes('admin'));
      } catch (error) {
        logger.error('Error in admin status check:', error);
        setError('Unexpected error checking admin status');
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  return { isAdmin, isLoading, error };
}
