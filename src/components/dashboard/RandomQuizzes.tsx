import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Quiz {
  id: string;
  name: string;
}

const RandomQuizzes = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRandomQuizzes() {
      try {
        const { data, error: supabaseError } = await supabase
          .from('quizzes')
          .select('id, name')
          .eq('verified', true)
          .order('id')
          .limit(3);

        if (supabaseError) {
          console.error('Supabase error:', {
            message: supabaseError.message,
            details: supabaseError.details,
            hint: supabaseError.hint,
            code: supabaseError.code,
          });
          setError(`Database error: ${supabaseError.message}`);
          return;
        }
        setQuizzes(data || []);
        setError(null);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred';
        console.error('Error fetching random quizzes:', {
          error,
          message: errorMessage,
          stack: error instanceof Error ? error.stack : undefined,
        });
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRandomQuizzes();
  }, []);

  if (isLoading) {
    return (
      <section className="dashboard-section mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Random Quizzes</h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="w-full">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="dashboard-section mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Random Quizzes</h2>
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          {error}
        </div>
      </section>
    );
  }
  return (
    <section className="dashboard-section mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Random Quizzes</h2>{' '}
      <div className="space-y-4">
        {quizzes.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No verified quizzes yet...
          </p>
        ) : (
          quizzes.map((quiz) => (
            <Link
              href={`/quiz/${quiz.id}`}
              key={quiz.id}
              className="block hover:transform hover:scale-[1.02] transition-all"
            >
              <div className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg group">
                <div className="flex-grow">
                  <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {quiz.name}
                  </h3>
                </div>
                <div className="ml-4">
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    Practice
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
};

export default RandomQuizzes;
