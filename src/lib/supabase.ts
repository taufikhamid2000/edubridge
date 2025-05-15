import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';

// Add environment information logs to help diagnose issues
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  logger.error('🚨 Missing Supabase credentials!', {
    urlExists: !!supabaseUrl,
    keyExists: !!supabaseAnonKey,
    env: process.env.NODE_ENV,
    isVercel: process.env.NEXT_PUBLIC_VERCEL_ENV === 'production',
  });
}

// Create Supabase client
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'edubridge-auth-storage-key',
    detectSessionInUrl: true,
  },
  global: {
    // Add request headers for tracking the source environment
    headers: {
      'x-app-env': process.env.NODE_ENV || 'unknown',
      'x-is-vercel':
        process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 'true' : 'false',
    },
  },
});

// Create a Supabase admin client with service role key
// This client bypasses RLS policies - USE WITH CAUTION
// Only use this for server-side operations where needed
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl || '', supabaseServiceKey, {
      auth: {
        persistSession: false, // Don't persist admin sessions for security
        autoRefreshToken: false, // Admin client doesn't need token refresh
      },
      global: {
        headers: {
          'x-app-env': process.env.NODE_ENV || 'unknown',
          'x-is-admin-client': 'true',
        },
      },
    })
  : supabase; // Fall back to regular client if no service key

/**
 * Handle auth session recovery when there's a token issue
 * This helps recover from "Invalid Refresh Token" errors
 */
export async function recoverSession() {
  try {
    // Get current session - may trigger a token refresh if needed
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      logger.warn('Session recovery needed, clearing auth state'); // Clear browser storage to remove any corrupted tokens
      if (typeof window !== 'undefined') {
        // Clear local storage auth data using our custom storage key
        localStorage.removeItem('edubridge-auth-storage-key');

        // Also clear any legacy keys that might exist
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('sb-refresh-token');
        localStorage.removeItem('sb-access-token');

        // Force sign out to clear any remaining session data
        await supabase.auth.signOut({ scope: 'global' });
      }

      return false;
    }

    return true;
  } catch (error) {
    logger.error('Error during session recovery:', error);
    return false;
  }
}
