import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  logger.error('Missing Supabase credentials!');
  throw new Error('Missing Supabase credentials');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: process.env.NODE_ENV === 'development',
    storage: {
      getItem: (key) => {
        try {
          return localStorage.getItem(key);
        } catch (error) {
          logger.error('Storage getItem error:', error);
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          logger.error('Storage setItem error:', error);
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          logger.error('Storage removeItem error:', error);
        }
      },
    },
  },
  global: {
    headers: {
      'X-Client-Info': 'edubridge-webapp',
    },
  },
});

/**
 * Handle auth session recovery when there's a token issue
 * This helps recover from "Invalid Refresh Token" errors
 */
export async function recoverSession() {
  try {
    logger.info('Attempting to recover auth session...');

    // First try to get current session
    const { data, error } = await supabase.auth.getSession();

    // If we get a valid session back, no need to recover
    if (data?.session) {
      logger.info('Valid session found, no recovery needed');
      return true;
    }

    if (error) {
      logger.warn('Session error, attempting recovery', {
        error: error.message,
      });

      // Only clear storage if we have a token-related error
      if (error.message.includes('token') || error.message.includes('Token')) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('sb-' + supabaseUrl + '-auth-token');
        }

        // Try to refresh the session one last time
        const refreshResult = await supabase.auth.getSession();
        if (refreshResult.data?.session) {
          logger.info('Session recovered successfully');
          return true;
        }
      }

      // If we still don't have a session, sign out cleanly
      await supabase.auth.signOut({ scope: 'local' });
      logger.info('Session recovery failed, signed out');
    }

    return false;
  } catch (error) {
    logger.error('Error during session recovery:', error);
    return false;
  }
}
