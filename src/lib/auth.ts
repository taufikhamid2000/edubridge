import { logger } from '@/lib/logger';
import { supabase } from './supabase';

export const signUp = async (email: string, password: string) => {
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) throw error;

  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({ email, password });

  if (signInError) throw signInError;
  return signInData.session;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data.session;
};

export const signOut = async () => {
  logger.log('SignOut function started');

  // Clear local session state and redirect FIRST, unconditionally. Logging
  // out is a client-side action — it must never be blocked by Supabase's
  // own availability. If Supabase is down, slow, or unreachable, the user
  // still ends up logged out on this device; they just don't get the
  // "invalidate every other device's session too" bonus until the server
  // call below succeeds (best-effort, not awaited by the caller).
  if (typeof window !== 'undefined') {
    logger.log('Removing auth token from localStorage');
    try {
      localStorage.removeItem('supabase.auth.token');
    } catch (error) {
      logger.error('Error clearing localStorage:', error);
    }
  }

  // Fire the server-side global revocation without blocking on it. Race
  // against a short timeout so a hung/unreachable request can never delay
  // the redirect below.
  Promise.race([
    supabase.auth.signOut({ scope: 'global' }),
    new Promise((resolve) => setTimeout(resolve, 3000)),
  ])
    .then((result) => {
      if (result && typeof result === 'object' && 'error' in result && result.error) {
        logger.error('Supabase signOut error (non-blocking):', result.error);
      } else {
        logger.log('Supabase signOut completed (or timed out without blocking)');
      }
    })
    .catch((error) => {
      logger.error('Error signing out from Supabase (non-blocking):', error);
    });

  logger.log('Redirecting to /auth...');

  // Use a hard redirect that won't be caught by Next.js router. Standardized
  // to /auth everywhere sign-out happens (Header, profile settings, and the
  // dedicated /auth/logout page all now land in the same place).
  document.location.href = '/auth';
  return true;
};
