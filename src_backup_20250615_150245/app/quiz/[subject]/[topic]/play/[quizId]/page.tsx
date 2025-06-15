'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchQuizWithQuestionsAPI } from '@/services/quizService';
import QuizPlayer from '@/components/quiz/QuizPlayer';
import { Question, Quiz, TopicContext } from '@/types/topics';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

export default function PlayQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params?.quizId as string;
  const subject = params?.subject as string;
  const topic = params?.topic as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [topicContext, setTopicContext] = useState<TopicContext | null>(null);

  // Check authentication
  useEffect(() => {
    async function checkAuth() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          logger.error('Auth error:', error);
          setError('Authentication error. Please log in again.');
          router.push('/auth');
          return;
        }

        if (!session?.user) {
          setError('You must be logged in to take a quiz.');
          router.push('/auth');
          return;
        }

        setUserId(session.user.id);
      } catch (err) {
        logger.error('Error checking authentication:', err);
        setError('Failed to verify authentication. Please try again.');
      } finally {
        setAuthLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  useEffect(() => {
    async function fetchQuizData() {
      if (!quizId) {
        setError('Quiz ID is required');
        setLoading(false);
        return;
      }

      // Wait for auth check to complete
      if (authLoading || !userId) {
        return;
      }
      try {
        const result = await fetchQuizWithQuestionsAPI(quizId);

        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }

        if (!result.quiz) {
          setError('Failed to load quiz data');
          setLoading(false);
          return;
        }

        setQuiz(result.quiz);
        setQuestions(result.questions);
        setTopicContext(result.topicContext);
      } catch (err) {
        logger.error('Error fetching quiz:', err);
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
  }, [quizId, authLoading, userId, topic]);

  if (loading || authLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                {authLoading
                  ? 'Verifying authentication...'
                  : 'Loading quiz...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quiz || !userId) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              Error Loading Quiz
            </h1>
            <p className="text-gray-700 dark:text-gray-300">
              {error || 'Quiz not found or authentication required'}
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {' '}
        <QuizPlayer
          quizId={quizId}
          quizName={quiz.name}
          questions={questions}
          timeLimit={15} // Hardcoded for now, would come from quiz.time_limit
          userId={userId}
          subject={subject}
          topic={topic}
          topicContext={topicContext}
          isVerified={quiz.verified}
          onComplete={() => {
            // Handle quiz completion
            logger.log('Quiz completed');
          }}
        />
      </div>
    </div>
  );
}
