/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Production debugging utility
 * Helps with troubleshooting issues that only appear in production
 */
import { logger } from './logger';

// Safe console logging that checks environment
export function logDebug(message: string, data?: any): void {
  if (data !== undefined) {
    logger.debug(message, data);
  } else {
    logger.debug(message);
  }
}

// Capture and report errors
export function captureError(error: Error, context?: string): void {
  // In production, this will still be logged via logger.error
  logger.error(`[ERROR]${context ? ` ${context}:` : ''} ${error.message}`);

  // For development, show the full error
  if (process.env.NODE_ENV !== 'production') {
    logger.error(error);
  }
}

// Simple performance tracking
export function trackPerformance(label: string): () => void {
  const start = performance.now();
  return () => {
    const duration = performance.now() - start;
    logger.perf(label, duration);
  };
}
