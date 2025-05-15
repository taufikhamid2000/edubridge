'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import AdminNavigation from '@/components/admin/AdminNavigation';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AccessDenied from '@/components/admin/AccessDenied';

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if current user has admin privileges
  useEffect(() => {
    async function checkAdminStatus() {
      try {
        // Get current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        // Handle session errors or missing session
        if (sessionError) {
          logger.warn('Session error in admin page:', sessionError);

          // Try to recover the session
          const { recoverSession } = await import('@/lib/supabase');
          const recovered = await recoverSession();

          if (!recovered) {
            router.push('/auth');
            return;
          }
        }

        if (!session) {
          logger.info('No active session, redirecting to auth');
          router.push('/auth');
          return;
        }

        try {
          // Import the admin client that bypasses RLS for the role check
          const { supabaseAdmin } = await import('@/lib/supabase');

          // Get user role directly with admin client to avoid RLS issues
          const { data: adminData, error: adminError } = await supabaseAdmin
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();
          if (adminError) {
            // Handle specific error codes
            if (adminError.code === 'PGRST116') {
              // No matching row found - user has no role assigned
              logger.info('User has no admin role assigned');
              setIsAdmin(false);
            } else if (
              adminError.code === '22023' ||
              adminError.code === 'PGRST103' || // Permission denied error
              adminError.message?.includes('role "admin" does not exist') ||
              adminError.message?.includes('permission denied')
            ) {
              // This could be either a PostgreSQL schema error or permissions issue
              logger.error(
                'Database error: Role check failed due to schema or permissions issue',
                adminError
              );

              // Fallback to a direct query bypassing enum constraints
              try {
                const { data: anyRoleData } = await supabaseAdmin
                  .from('user_roles')
                  .select('*') // Select all columns to get any available role data
                  .eq('user_id', session.user.id)
                  .maybeSingle(); // Check if user has an admin role - using loose comparison to handle case differences
                if (anyRoleData && anyRoleData.role) {
                  const roleValue = anyRoleData.role.toLowerCase();
                  const isAdminRole =
                    roleValue === 'admin' || roleValue.includes('admin');

                  logger.info(
                    `User has role: ${anyRoleData.role} - admin access: ${isAdminRole}`
                  );
                  setIsAdmin(isAdminRole);
                } else {
                  setIsAdmin(false);
                }
              } catch (fallbackError) {
                logger.error('Fallback role check also failed:', fallbackError);
                setIsAdmin(false);
              }
            } else {
              // Other database errors
              logger.error('Database error checking admin status:', adminError);
              setIsAdmin(false);
            }
          } else {
            // Successfully retrieved user role
            // Use loose comparison for role check to handle potential case differences
            const roleValue = (adminData?.role || '').toLowerCase();
            const isUserAdmin =
              roleValue === 'admin' || roleValue.includes('admin');
            setIsAdmin(isUserAdmin);
            logger.info(
              `Admin check completed: ${isUserAdmin ? 'is admin' : 'not admin'} (role: ${adminData?.role})`
            );
          }
        } catch (error) {
          // Handle any other errors during admin check
          logger.error('Failed to check admin status:', error);
          setIsAdmin(false);
        }
      } catch (error) {
        // Catch-all for any unexpected errors
        logger.error('Unexpected error in admin check:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAdminStatus();
  }, [router]);
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }
  if (!isAdmin) {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        <AdminNavigation />
        <div className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold dark:text-white">
              Admin Dashboard
            </h1>
            <div>
              <button
                onClick={() => logger.log('Dashboard refresh clicked')}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                Refresh Data
              </button>
            </div>
          </div>
          <AdminDashboard />
        </div>
      </div>
    </div>
  );
}
