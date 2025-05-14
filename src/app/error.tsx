'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    logger.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
          Something went wrong
        </h2>
        <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-md mb-4">
          <p className="text-sm font-mono text-red-600 dark:text-red-400">
            {error?.message || 'Unknown error occurred'}
          </p>
          {error?.digest && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Error ID: {error.digest}
            </p>
          )}
        </div>
        <button
          onClick={() => reset()}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
