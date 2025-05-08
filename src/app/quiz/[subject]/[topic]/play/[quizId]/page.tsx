'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getQuizWithQuestions } from '@/lib/quiz';
import QuizPlayer from '@/components/quiz/QuizPlayer';
import { Question, Quiz } from '@/types/topics';

export default function PlayQuizPage() {
  const params = useParams();
  const quizId = params?.quizId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    async function fetchQuizData() {
      if (!quizId) {
        setError('Quiz ID is required');
        setLoading(false);
        return;
      }

      try {
        const quizData = await getQuizWithQuestions(quizId);

        if (!quizData) {
          setError('Failed to load quiz data');
          setLoading(false);
          return;
        }

        setQuiz(quizData.quiz);
        setQuestions(quizData.questions);
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'An error occurred loading the quiz'
        );
      } finally {
        setLoading(false);
      }
    }

    fetchQuizData();
  }, [quizId]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Loading quiz...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              Error Loading Quiz
            </h1>
            <p className="text-gray-700 dark:text-gray-300">
              {error || 'Quiz not found'}
            </p>
            <button
              onClick={() => window.history.back()}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Hardcoded user ID for now, in a real app this would come from authentication
  const userId = 'test-user-id';

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <QuizPlayer
          quizId={quizId}
          quizName={quiz.name}
          questions={questions}
          timeLimit={15} // Hardcoded for now, would come from quiz.time_limit
          userId={userId}
          onComplete={() => {
            // Handle quiz completion
            console.log('Quiz completed');
          }}
        />
      </div>
    </div>
  );
}
