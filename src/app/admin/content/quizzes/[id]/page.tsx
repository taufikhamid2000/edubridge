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
    <div className="flex justify-center items-center min-h-screen bg-gray-900 dark:bg-gray-50">
      <div className="text-center p-8 bg-gray-800 dark:bg-white rounded-lg shadow-md max-w-md">
        <div className="mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
        <h2 className="text-xl font-semibold text-white dark:text-gray-900 mb-2">
          Redirecting to Audit System
        </h2>
        <p className="text-gray-400 dark:text-gray-600">
          Quiz editing has been replaced with the new audit system. Redirecting
          you to the audit page...
        </p>
      </div>
    </div>
  );
}
