/**
 * Production debugging utility
 * Helps with troubleshooting issues that only appear in production
 */

// Safe console logging that checks environment
export function logDebug(message: string, data?: never): void {
  // Only log in development or if production debugging is enabled
  if (process.env.NODE_ENV !== 'production' || process.env.DEBUG === 'true') {
    if (data) {
      console.log(`[DEBUG] ${message}`, data);
    } else {
      console.log(`[DEBUG] ${message}`);
    }
  }
}

// Capture and report errors
export function captureError(error: Error, context?: string): void {
  // In production, you might want to send this to a logging service
  console.error(`[ERROR]${context ? ` ${context}:` : ''} ${error.message}`);
  
  // For development, show the full error
  if (process.env.NODE_ENV !== 'production') {
    console.error(error);
  }
}

// Simple performance tracking
export function trackPerformance(label: string): () => void {
  if (process.env.NODE_ENV !== 'production' || process.env.DEBUG === 'true') {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      console.log(`[PERF] ${label}: ${duration.toFixed(2)}ms`);
    };
  }
  return () => {}; // No-op in production unless debug is enabled
}