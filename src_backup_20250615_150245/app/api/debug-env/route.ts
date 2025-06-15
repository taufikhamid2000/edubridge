import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    // Get information about the environment variables
    const serviceKeyAvailable = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    let adminClientStatus = 'unknown';

    if (serviceKeyAvailable) {
      adminClientStatus = 'configured';
    } else {
      adminClientStatus = 'using fallback';
    }

    // Build a diagnostic object that's safe to return (no actual secrets)
    const envInfo = {
      serviceKeyAvailable,
      adminClientStatus,
      environment: process.env.NODE_ENV || 'unknown',
      nodeVersion: process.version,
      serverTime: new Date().toISOString(),
      supabaseUrlConfigured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKeyConfigured: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    };

    return NextResponse.json(envInfo);
  } catch (error) {
    logger.error('Error in debug-env API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
