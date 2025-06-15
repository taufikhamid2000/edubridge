import { logger } from './logger';

export function validateSupabaseConfig() {
  // Wait for next.js to fully load environment variables
  return new Promise((resolve) => {
    const check = () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!url || !key) {
        setTimeout(check, 100); // Check again in 100ms
        return;
      }

      try {
        // Validate URL format
        new URL(url);

        // Validate anon key format
        if (!key.startsWith('eyJ') || key.length < 100) {
          throw new Error('Invalid NEXT_PUBLIC_SUPABASE_ANON_KEY format');
        }

        resolve(true);
      } catch (error) {
        logger.error('Environment validation failed:', error);
        logger.error('Please check your .env file contains valid values.');
        resolve(false);
      }
    };

    check();
  });
}
