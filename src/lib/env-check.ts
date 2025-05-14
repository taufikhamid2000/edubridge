/**
 * Environment variable validation to prevent deployment with missing required variables
 */
import { logger } from './logger';

// Add your required environment variables here
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

export function validateEnvironment(): void {
  // Skip in development mode
  if (process.env.NODE_ENV === 'development') {
    return;
  }

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );
  if (missingVars.length > 0) {
    logger.error(
      `Error: Missing required environment variables: ${missingVars.join(', ')}`
    );
    // In build scripts, you might want to exit the process
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}`
      );
    }
  }
}
