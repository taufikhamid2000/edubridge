import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const cookieStore = await cookies();

    // Log all cookies for debugging
    const allCookies = cookieStore.getAll();
    logger.info(
      `Found ${allCookies.length} cookies:`,
      allCookies.map((c) => ({
        name: c.name,
        value: c.value ? c.value.substring(0, 5) + '...' : 'empty',
      }))
    );

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => {
            const cookie = cookieStore.get(name);
            logger.info(`Cookie requested: ${name}, exists: ${!!cookie}`);
            return cookie?.value;
          },
          set: () => {}, // Not needed for this endpoint
          remove: () => {},
        },
      }
    );

    // Get current session
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      logger.error('Error getting session:', error);
      return NextResponse.json(
        { error: 'Error checking session' },
        { status: 500 }
      );
    }

    // Check if we have an active session
    if (!data.session) {
      logger.warn('No active session found');
      return NextResponse.json({
        status: 'Not logged in',
        message: 'No active session found',
        timestamp: new Date().toISOString(),
      });
    }

    // If we have a session, check for admin role
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', data.session.user.id)
      .single();

    if (roleError) {
      logger.error('Error checking user role:', roleError);
    }

    return NextResponse.json({
      status: 'Logged in',
      user: {
        id: data.session.user.id,
        email: data.session.user.email,
        role: userRoles?.role || 'No role found',
      },
      sessionInfo: {
        expiresAt: data.session.expires_at
          ? new Date(data.session.expires_at * 1000).toISOString()
          : 'unknown',
        currentTime: new Date().toISOString(),
        isExpired: data.session.expires_at
          ? Date.now() / 1000 > data.session.expires_at
          : false,
      },
    });
  } catch (error) {
    logger.error('Error in check-session:', error);
    return NextResponse.json(
      { error: 'Error checking session' },
      { status: 500 }
    );
  }
}
