/* eslint-disable react/no-unescaped-entities */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { logger } from '@/lib/logger';

export default function NotFound() {
  const pathname = usePathname();

  useEffect(() => {
    logger.debug(`404 Page not found: ${pathname}`);

    // If this is a topic page, log additional details
    if (pathname?.includes('/quiz/')) {
      const segments = pathname.split('/');
      if (segments.length >= 4) {
        const subject = segments[2];
        const topic = segments[3];
        logger.debug(`Not Found: subject=${subject}, topic=${topic}`);
      }
    }
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600 dark:text-blue-400">
          Page Not Found
        </h1>

        <div className="mb-6 text-center">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We couldn't find the page you're looking for.
          </p>

          {pathname?.includes('/quiz/') && (
            <p className="text-sm bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-md text-yellow-800 dark:text-yellow-300 mb-4">
              The topic or subject you're looking for might not exist or has
              been removed.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-center transition-colors"
          >
            Go to Dashboard
          </Link>

          <button
            onClick={() => window.history.back()}
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-4 rounded text-center transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
