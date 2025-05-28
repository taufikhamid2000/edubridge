import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';

// Add environment information logs to help diagnose issues
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Get the service role key and add some debugging
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Debug environment information without exposing the actual keys
const envDebug = {
  hasUrl: !!supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  hasServiceKey: !!supabaseServiceKey,
  keyLength: supabaseServiceKey?.length || 0,
  nodeEnv: process.env.NODE_ENV,
  isServer: typeof window === 'undefined',
};

logger.info('📊 Environment variables debug info:', envDebug);

if (!supabaseUrl || !supabaseAnonKey) {
  logger.error('🚨 Missing Supabase credentials!', {
    urlExists: !!supabaseUrl,
    keyExists: !!supabaseAnonKey,
    env: process.env.NODE_ENV,
    isVercel: process.env.NEXT_PUBLIC_VERCEL_ENV === 'production',
  });
}

// Create Supabase client with anonymous key for public operations
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'edubridge-auth-storage-key',
    detectSessionInUrl: true,
    // Optimize OAuth flow settings
    flowType: 'pkce', // Use PKCE flow for better security
    debug: process.env.NODE_ENV === 'development',
  },
  global: {
    // Add request headers for tracking the source environment
    headers: {
      'x-app-env': process.env.NODE_ENV || 'unknown',
      'x-is-vercel':
        process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 'true' : 'false',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    // Optimize realtime settings
    heartbeatIntervalMs: 30000,
    reconnectAfterMs: (tries: number) => Math.min(tries * 1000, 30000),
  },
});

// Create a Supabase admin client with service role key
// This client bypasses RLS policies - USE WITH CAUTION
// Only use this for server-side operations where needed

// Check both server-side and client-side environments
const isServer = typeof window === 'undefined';

// Better service key handling
let serviceKeyValid = false;
if (!supabaseServiceKey) {
  logger.warn(
    '⚠️ No SUPABASE_SERVICE_ROLE_KEY available - admin operations will fall back to regular client'
  );
} else if (supabaseServiceKey.length < 20) {
  logger.warn(
    '⚠️ SUPABASE_SERVICE_ROLE_KEY appears to be invalid (too short) - check your .env file'
  );
} else {
  serviceKeyValid = true;
  if (isServer) {
    logger.info('✅ Service role key loaded successfully on the server');
  }
}

// Only create admin client with valid service key
export const supabaseAdmin =
  serviceKeyValid && supabaseServiceKey
    ? createClient(supabaseUrl || '', supabaseServiceKey, {
        auth: {
          persistSession: false, // Don't persist admin sessions for security
          autoRefreshToken: false, // Admin client doesn't need token refresh
        },
        global: {
          headers: {
            'x-app-env': process.env.NODE_ENV || 'unknown',
            'x-is-admin-client': 'true',
            'x-client-init-time': new Date().toISOString(),
          },
        },
      })
    : supabase; // Fall back to regular client if no service key

// Log if admin client successfully created (without exposing sensitive data)
logger.info(
  `🔐 Supabase admin client status: ${supabaseServiceKey ? 'configured' : 'using fallback'}`
);

/**
 * Handle auth session recovery when there's a token issue
 * This helps recover from "Invalid Refresh Token" errors
 */
export async function recoverSession() {
  try {
    // Log that we're attempting session recovery
    logger.info('Attempting to recover auth session...');

    // Get current session - may trigger a token refresh if needed
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      logger.warn('Session recovery needed, clearing auth state', {
        error: error ? error.message : 'No session found',
        hasSession: !!data?.session,
      });

      // Clear browser storage to remove any corrupted tokens
      if (typeof window !== 'undefined') {
        // Clear local storage auth data using our custom storage key
        localStorage.removeItem('edubridge-auth-storage-key');

        // Also clear any legacy keys that might exist
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('sb-refresh-token');
        localStorage.removeItem('sb-access-token');

        // Force sign out to clear any remaining session data
        await supabase.auth.signOut({ scope: 'global' });

        logger.info('Auth storage cleared and user signed out');

        // Optional: Redirect to login page after 2 seconds
        setTimeout(() => {
          window.location.href = '/auth';
        }, 2000);
      }

      return false;
    }

    // Session exists and is valid
    logger.info('Session recovery successful', {
      userId: data.session.user.id,
      expiresAt: new Date(data.session.expires_at! * 1000).toISOString(),
    });
    return true;
  } catch (error) {
    logger.error('Error during session recovery:', error);
    return false;
  }
}
