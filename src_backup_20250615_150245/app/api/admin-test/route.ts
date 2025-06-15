import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';

/**
 * Admin test endpoint to verify database access and service role permissions
 * This is a diagnostic route to help troubleshoot admin access issues
 */
export async function GET() {
  try {
    logger.info('Admin test route accessed');

    // Test database connection with admin client
    const { data: dbTest, error: dbError } = await supabaseAdmin
      .from('user_roles')
      .select('*')
      .limit(5); // Count admin users directly without using the RPC function
    // This avoids the missing function error
    const { count, error: countError } = await supabaseAdmin
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin');

    // Get current user if authenticated
    const {
      data: { session },
      error: sessionError,
    } = await supabaseAdmin.auth.getSession();
    const currentUserId = session?.user?.id;

    let currentUserRole = null;
    if (currentUserId) {
      const { data: userRole } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUserId)
        .maybeSingle();

      currentUserRole = userRole?.role;
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      adminClientWorking: !dbError,
      userRolesFound: dbTest?.length || 0,
      adminUsersCount: count,
      currentUser: currentUserId
        ? {
            id: currentUserId,
            role: currentUserRole,
          }
        : null,
      errors: {
        dbError: dbError
          ? { message: dbError.message, code: dbError.code }
          : null,
        countError: countError
          ? { message: countError.message, code: countError.code }
          : null,
        sessionError: sessionError
          ? { message: sessionError.message, code: sessionError.code }
          : null,
      },
    });
  } catch (error: unknown) {
    logger.error('Error in admin test route:', error instanceof Error ? error.message : error);
    logger.error('Error in admin test route:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack:
            process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
        },
      },
      { status: 500 }
    );
  }
}
