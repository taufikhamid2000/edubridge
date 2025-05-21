import { NextResponse } from 'next/server';

// This endpoint helps diagnose environment variable issues
// It only exposes the existence of variables, not their values
export async function GET() {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return NextResponse.json({
    serverTime: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    isServer: typeof window === 'undefined',

    // Check for key existence but don't expose actual keys
    credentials: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!supabaseServiceKey,
      serviceKeyLength: supabaseServiceKey?.length || 0,
    },

    // Additional helpful info
    nodeVersion: process.version,
    runtimeInfo: {
      engine: process.env.npm_config_user_agent || 'Unknown',
      home: process.env.HOME || process.env.USERPROFILE || 'Unknown',
    },
  });
}
