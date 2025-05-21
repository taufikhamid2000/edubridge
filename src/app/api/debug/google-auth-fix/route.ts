import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const cookieStore = await cookies();

    // Create a regular client for auth (not admin)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => cookieStore.get(name)?.value,
          set: (name, value, options) => {
            cookieStore.set({ name, value, ...options });
          },
          remove: (name, options) => {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    // Get session and current user
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Not logged in', requiresLogin: true },
        { status: 401 }
      );
    }

    // Check if this user has an admin role in the database
    const { data: existingRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    // Check if this is the first user or has existing admin role
    const isFirstUser = await checkIfFirstUser();
    const hasAdminRole = existingRole?.role === 'admin';

    if (isFirstUser || hasAdminRole) {
      // Grant admin privileges
      const { error } = await supabaseAdmin
        .from('user_roles')
        .upsert({
          user_id: session.user.id,
          role: 'admin',
        })
        .select();

      if (error) {
        logger.error('Error setting admin role:', error);
        return NextResponse.json(
          { error: 'Failed to set admin role' },
          { status: 500 }
        );
      }

      logger.info(
        `Admin role granted to ${session.user.email} (${session.user.id})`
      );

      return NextResponse.json({
        success: true,
        message: isFirstUser
          ? 'You are the first user - admin role granted!'
          : 'Admin role confirmed!',
        user: {
          id: session.user.id,
          email: session.user.email,
          role: 'admin',
        },
      });
    }

    return NextResponse.json({
      success: false,
      message: 'You do not have admin privileges.',
    });
  } catch (error) {
    logger.error('Google auth admin fix error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to check if this is the first user in the system
async function checkIfFirstUser() {
  try {
    const { count, error } = await supabaseAdmin
      .from('user_roles')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    // If there are no users in the user_roles table, this is the first user
    return count === 0;
  } catch (error) {
    logger.error('Error checking if first user:', error);
    return false;
  }
}
