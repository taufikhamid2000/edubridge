'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

/**
 * Custom hook to handle OAuth redirects and clean up URL tokens
 * Ensures consistent behavior after OAuth authentication
 */
export const useOAuthRedirect = (redirectPath: string = '/dashboard') => {
  const router = useRouter();

  const cleanUrlTokens = useCallback(() => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash;

    // Check if URL contains OAuth tokens
    if (
      hash &&
      (hash.includes('access_token=') ||
        hash.includes('refresh_token=') ||
        hash.includes('expires_at=') ||
        hash.includes('token_type=') ||
        hash.includes('expires_in='))
    ) {
      // Clean the URL by removing the hash
      const cleanUrl = window.location.pathname + window.location.search;
      window.history.replaceState(null, '', cleanUrl);
      logger.info('🔧 Cleaned OAuth tokens from URL hash');
      return true;
    }
    return false;
  }, []);

  const handleAuthRedirect = useCallback(async () => {
    try {
      // Get session to check if user is authenticated
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        logger.error('❌ Error getting session during OAuth redirect:', error);
        return;
      }

      if (session) {
        logger.info('✅ OAuth authentication successful, redirecting...');

        // Clean tokens from URL
        cleanUrlTokens();

        // Small delay to ensure URL is cleaned before redirect
        setTimeout(() => {
          router.replace(redirectPath);
        }, 100);
      }
    } catch (err) {
      logger.error('❌ Error handling OAuth redirect:', err);
    }
  }, [router, redirectPath, cleanUrlTokens]);

  useEffect(() => {
    // Check if we're on a page that might have OAuth tokens
    const hasTokensInUrl = cleanUrlTokens();

    if (hasTokensInUrl) {
      // If we cleaned tokens, check if we should redirect
      handleAuthRedirect();
    }

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // logger.info('🔐 User signed in via OAuth');

        // Clean URL and redirect
        setTimeout(() => {
          cleanUrlTokens();
          router.replace(redirectPath);
        }, 200);
      }
    });

    // Clean up on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [handleAuthRedirect, cleanUrlTokens, router, redirectPath]);

  return {
    cleanUrlTokens,
    handleAuthRedirect,
  };
};
