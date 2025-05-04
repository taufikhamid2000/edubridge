'use client';

import { useEffect, useState } from 'react';

export default function ErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Add global error handler
    const handleError = (error: ErrorEvent) => {
      console.error('Global error caught:', error);
      setError(error.error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 dark:bg-red-900/30 p-6 rounded-lg shadow-md max-w-xl w-full">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Something went wrong
          </h2>
          <p className="mb-4 text-gray-800 dark:text-gray-200">
            We&rsquo;ve encountered an error and our team has been notified.
          </p>
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-auto max-h-40">
            <pre className="text-red-600 dark:text-red-400">
              {error?.message || 'Unknown error'}
            </pre>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
