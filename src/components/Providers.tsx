'use client';

import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initConsoleOverride } from '@/lib/console-override';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 2,
      refetchOnWindowFocus: process.env.NODE_ENV === 'production',
    },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize console override in production
    if (process.env.NODE_ENV === 'production') {
      initConsoleOverride();
    }

    // Add a periodic session check to prevent token issues
    const checkInterval = setInterval(
      async () => {
        try {
          const { error } = await supabase.auth.getSession();
          if (error) {
            logger.warn('Scheduled session check failed:', error);
            const { recoverSession } = await import('@/lib/supabase');
            await recoverSession();
          }
        } catch (err) {
          logger.error('Error in scheduled session check:', err);
        }
      },
      5 * 60 * 1000
    ); // Check every 5 minutes

    // Set up Supabase auth refresh with enhanced error handling
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'TOKEN_REFRESHED') {
        logger.info('Auth token refreshed successfully');

        // Optional: Update query client to reflect newly authenticated state
        queryClient.invalidateQueries();
      } else if (event === 'SIGNED_IN') {
        logger.info('User signed in successfully');
      } else if (event === 'SIGNED_OUT') {
        logger.info('User signed out');
      } else if (event === 'USER_UPDATED') {
        logger.info('User data updated');
      } else if (event === 'PASSWORD_RECOVERY') {
        logger.info('Password recovery initiated');
      }

      // Handle potential auth errors by checking for any issues with the session
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        logger.warn('Session issues detected, attempting recovery');

        try {
          // Import recoverSession function
          const { recoverSession } = await import('@/lib/supabase');
          await recoverSession();

          // After recovery attempt, check if we need to redirect to auth
          const { data } = await supabase.auth.getSession();
          if (!data.session) {
            logger.warn('Session recovery failed, redirecting to auth page');
            window.location.href = '/auth';
          }
        } catch (err) {
          logger.error('Error during token refresh recovery:', err);
        }
      }
    });
    return () => {
      subscription.unsubscribe();
      clearInterval(checkInterval);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
