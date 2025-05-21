import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => cookieStore.get(name)?.value,
          set: () => {}, // Not needed for this endpoint
          remove: () => {},
        },
      }
    );

    // Get current user
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({
        status: 'Not logged in',
        message: 'No active session found',
      });
    }

    // Get user roles directly from the database
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', session.user.id);

    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    return NextResponse.json({
      status: 'Logged in',
      user: {
        id: session.user.id,
        email: session.user.email,
        role:
          userRoles && userRoles.length > 0
            ? userRoles[0].role
            : 'No role found',
      },
      userRoles: userRoles || [],
      roleError,
      profile,
      profileError,
      sessionExpires: session.expires_at
        ? new Date(session.expires_at * 1000).toISOString()
        : 'unknown',
    });
  } catch (error) {
    logger.error('Error in check-auth:', error);
    return NextResponse.json(
      { error: 'Error checking authentication status' },
      { status: 500 }
    );
  }
}
