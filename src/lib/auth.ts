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
  try {
    // Sign out from both local session and server session
    logger.log('Calling supabase.auth.signOut()...');
    const { error } = await supabase.auth.signOut({ scope: 'global' });

    if (error) {
      logger.error('Supabase signOut error:', error);
    } else {
      logger.log('Supabase signOut successful');
    }

    // Clear any locally stored auth data
    if (typeof window !== 'undefined') {
      logger.log('Removing auth token from localStorage');
      localStorage.removeItem('supabase.auth.token');
    }

    logger.log('Redirecting to /auth...');

    // Use a hard redirect that won't be caught by Next.js router. Standardized
    // to /auth everywhere sign-out happens (Header, profile settings, and the
    // dedicated /auth/logout page all now land in the same place).
    document.location.href = '/auth';
    return true; // Signal that signout completed successfully
  } catch (error) {
    logger.error('Error signing out:', error);
    // Force redirect to auth page even if there was an error
    document.location.href = '/auth';
    return false;
  }
};
