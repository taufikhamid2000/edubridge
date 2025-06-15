/* eslint-disable @typescript-eslint/no-unused-vars */
import { createClient, Session, AuthError } from '@supabase/supabase-js';
import { logger } from './logger';
import { validateSupabaseConfig } from './validateEnv';

// Initialize Supabase singleton client
let _supabaseClient: ReturnType<typeof createClient> | null = null;

function initializeSupabaseClient() {
  if (_supabaseClient) return _supabaseClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    logger.error('Missing Supabase credentials!');
    throw new Error('Missing Supabase credentials');
  }
  _supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true, // Re-enable but with controlled logging
      persistSession: true,
      detectSessionInUrl: false, // Keep this disabled to prevent URL-based auth loops
      flowType: 'pkce',
      debug: false, // Completely disable debug logging
    },
    global: {
      headers: { 'X-Client-Info': 'edubridge-webapp' },
    },
  });

  return _supabaseClient;
}

// Cache implementation
const AUTH_CACHE_KEY = 'sb_auth_cache';
const AUTH_CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
let sessionPromise: Promise<{
  data: { session: Session | null };
  error: AuthError | null;
} | null> | null = null;

interface CachedAuth {
  session: Session | null;
  timestamp: number;
}

// Safe localStorage access
const safeStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      logger.error('Storage getItem error:', error);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      logger.error('Storage setItem error:', error);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      logger.error('Storage removeItem error:', error);
    }
  },
};

function getAuthFromCache(): CachedAuth | null {
  try {
    const cached = safeStorage.getItem(AUTH_CACHE_KEY);
    if (!cached) return null;

    const { session, timestamp } = JSON.parse(cached) as CachedAuth;
    if (Date.now() - timestamp > AUTH_CACHE_EXPIRY) {
      safeStorage.removeItem(AUTH_CACHE_KEY);
      return null;
    }

    return { session, timestamp };
  } catch (error) {
    logger.error('Error reading auth cache:', error);
    return null;
  }
}

function setAuthInCache(session: Session | null) {
  try {
    const cache: CachedAuth = {
      session,
      timestamp: Date.now(),
    };
    safeStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    logger.error('Error setting auth cache:', error);
  }
}

// Helper to get cached or fresh session
export async function getSession(): Promise<Session | null> {
  // Check if we already have a pending session request
  if (sessionPromise) {
    const result = await sessionPromise;
    return result?.data.session ?? null;
  }

  // Check cache first
  const cached = getAuthFromCache();
  if (cached?.session) {
    return cached.session;
  }

  // Get fresh session
  try {
    sessionPromise = supabase.auth.getSession();
    const result = await sessionPromise;
    sessionPromise = null;

    if (result) {
      const {
        data: { session },
        error,
      } = result;
      if (error) {
        logger.error('Error getting session:', error);
        return null;
      }
      if (session) {
        setAuthInCache(session);
      }
      return session;
    }
    return null;
  } catch (error) {
    logger.error('Error getting session:', error);
    sessionPromise = null;
    return null;
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  logger.error('Missing Supabase credentials!');
  throw new Error('Missing Supabase credentials');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true, // Keep token refresh for login to work
    persistSession: true,
    detectSessionInUrl: true, // Need this for OAuth to work
    flowType: 'pkce',
    debug: false, // Disable verbose logging for cleaner console output
    storage: {
      getItem: (key) => {
        try {
          // Check auth cache first for auth-token
          if (key.endsWith('-auth-token')) {
            const cached = getAuthFromCache();
            if (cached?.session) {
              return JSON.stringify(cached.session);
            }
          }
          return safeStorage.getItem(key);
        } catch (error) {
          logger.error('Storage getItem error:', error);
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          // Update auth cache for auth-token
          if (key.endsWith('-auth-token')) {
            setAuthInCache(JSON.parse(value));
          }
          safeStorage.setItem(key, value);
        } catch (error) {
          logger.error('Storage setItem error:', error);
        }
      },
      removeItem: (key) => {
        try {
          if (key.endsWith('-auth-token')) {
            safeStorage.removeItem(AUTH_CACHE_KEY);
          }
          safeStorage.removeItem(key);
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
 * Get the current session with caching to prevent multiple simultaneous requests
 */
export async function getCachedSession(): Promise<{
  data: { session: Session | null };
  error: AuthError | null;
}> {
  // Return existing promise if we're already fetching a session
  if (sessionPromise) {
    const promiseResult = await sessionPromise;
    return promiseResult || { data: { session: null }, error: null };
  }

  try {
    // Check cache first
    const cached = getAuthFromCache();
    if (cached?.session) {
      return { data: { session: cached.session }, error: null };
    } // If no cache or expired, fetch new session
    sessionPromise = supabase.auth.getSession();
    const result = await sessionPromise;

    if (result?.error) {
      logger.error('Error getting session:', result.error);
    }

    // Cache successful result
    if (result && result.data?.session) {
      setAuthInCache(result.data.session);
    }

    return result || { data: { session: null }, error: null };
  } finally {
    // Clear the promise so subsequent calls will make a new request
    sessionPromise = null;
  }
}

/**
 * Handle auth session recovery when there's a token issue
 * This helps recover from "Invalid Refresh Token" errors
 * Returns a boolean indicating if recovery was successful
 */
export async function recoverSession(): Promise<boolean> {
  try {
    logger.info('Attempting to recover auth session...');

    // Clear all session state first
    sessionPromise = null;
    if (typeof window !== 'undefined') {
      safeStorage.removeItem(AUTH_CACHE_KEY);
      safeStorage.removeItem('sb-access-token');
      safeStorage.removeItem('sb-refresh-token');
      safeStorage.removeItem('supabase.auth.token');
    }

    // Try to refresh the session using refresh token
    const {
      data: { session },
      error: refreshError,
    } = await supabase.auth.getSession();

    if (refreshError) {
      logger.error('Error refreshing session:', refreshError);
      // Perform a complete signout if refresh fails
      await supabase.auth.signOut({ scope: 'global' });
      return false;
    }

    if (session) {
      logger.info('Session successfully recovered');
      return true;
    }

    // No session recovered
    logger.info('No session could be recovered');
    return false;
  } catch (error) {
    logger.error('Critical error during session recovery:', error);
    // Force a complete signout on critical errors
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (signOutError) {
      logger.error('Error during emergency signout:', signOutError);
    }
    return false;
  }
}
