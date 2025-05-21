import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    // Get the key from the .env file
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceKey) {
      return NextResponse.json(
        {
          success: false,
          message: 'No service key available in environment variables',
          fixNeeded:
            'Add SUPABASE_SERVICE_ROLE_KEY to .env.local and restart the server',
        },
        { status: 500 }
      );
    }

    // Create a temporary admin client directly using the key
    // This bypasses any issues with the cached instance
    const tempAdmin = createClient(supabaseUrl || '', serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Test if the admin client works by performing a small query
    const { error, count } = await tempAdmin
      .from('user_roles')
      .select('*', { count: 'exact', head: true });

    if (error) {
      logger.error('Admin client test failed:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Service key verification failed',
          error: error.message,
          code: error.code,
          hint: 'The service key may be incorrect or not have proper permissions',
        },
        { status: 500 }
      );
    }

    // If we get here, the admin client works!
    return NextResponse.json({
      success: true,
      message: 'Service role key verified and working!',
      keyLength: serviceKey.length,
      testQuerySuccessful: true,
      recordCount: count ?? 0,
    });
  } catch (error) {
    logger.error('Error verifying service key:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error verifying service key',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
