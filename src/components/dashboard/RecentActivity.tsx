/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import Link from 'next/link';

interface QuizAttempt {
  id: string;
  quizTitle: string;
  subject: string;
  topic: string;
  score: number;
  totalQuestions: number;
  attemptedAt: string;
  completed: boolean;
}

interface RecentActivityProps {
  recentActivity: QuizAttempt[];
  isLoading: boolean;
  error: string | null;
}

const RecentActivity = ({
  recentActivity,
  isLoading,
  error,
}: RecentActivityProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const renderScorePercentage = (score: number, total: number) => {
    const percentage = Math.round((score / total) * 100);

    let scoreColor = 'bg-green-500';
    if (percentage < 70) {
      scoreColor = 'bg-yellow-500';
    }
    if (percentage < 50) {
      scoreColor = 'bg-red-500';
    }

    return (
      <div className="flex items-center">
        <div className="w-full bg-gray-200 rounded-full h-2 mr-2 dark:bg-gray-700">
          <div
            className={`h-2 rounded-full ${scoreColor}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="text-sm font-medium">
          {score}/{total} ({percentage}%)
        </span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <section className="bg-gray-800 dark:bg-white shadow-md rounded-lg p-6 text-gray-200 dark:text-gray-800">
        <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
        <div className="animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="mb-4 border-b pb-4 last:border-b-0 last:pb-0"
            >
              <div className="h-5 bg-gray-300 rounded dark:bg-gray-600 w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-1/2 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded dark:bg-gray-700 w-full"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-gray-800 dark:bg-white shadow-md rounded-lg p-6 text-gray-200 dark:text-gray-800">
        <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
        <div className="text-red-500 p-4 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-200">
          Error loading recent activity: {error}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-800 dark:bg-white shadow-md rounded-lg p-6 text-gray-200 dark:text-gray-800">
      <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>

      {recentActivity.length === 0 ? (
        <div className="text-gray-500 text-center py-4 dark:text-gray-400">
          <p>You haven't attempted any quizzes yet.</p>
          <Link
            href="/quiz/mathematics/chapters"
            className="inline-block mt-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Try a quiz now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {recentActivity.map((attempt) => (
            <div
              key={attempt.id}
              className="border-b pb-4 last:border-b-0 last:pb-0 dark:border-gray-700"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">
                    <Link
                      href={`/quiz/${attempt.subject}/${attempt.topic}`}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {attempt.quizTitle}
                    </Link>
                  </h3>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    {attempt.subject} &gt; {attempt.topic}
                  </p>
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  {formatDate(attempt.attemptedAt)}
                </div>
              </div>

              <div className="mt-2">
                {attempt.completed ? (
                  renderScorePercentage(attempt.score, attempt.totalQuestions)
                ) : (
                  <span className="text-yellow-600 text-sm dark:text-yellow-400">
                    Incomplete
                  </span>
                )}
              </div>
            </div>
          ))}

          <div className="text-center pt-2">
            <Link
              href="/user/history"
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View all activity
            </Link>
          </div>
        </div>
      )}
    </section>
  );
};

export default RecentActivity;
