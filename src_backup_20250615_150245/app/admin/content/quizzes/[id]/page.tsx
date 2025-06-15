'use client';
// Import dynamic config to optimize build
import './config';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminQuizContentRedirect() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const quizId = params?.id;

  useEffect(() => {
    // Redirect to the new audit page
    if (quizId) {
      router.replace(`/admin/quizzes/${quizId}/audit`);
    } else {
      router.replace('/admin/quizzes');
    }
  }, [quizId, router]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md">
        <div className="mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Redirecting to Audit System
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Quiz editing has been replaced with the new audit system. Redirecting
          you to the audit page...
        </p>
      </div>
    </div>
  );
}
