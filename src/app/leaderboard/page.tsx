'use client';

import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';
import LeaderboardFilters from '@/components/leaderboard/LeaderboardFilters';
import LeaderboardHeader from '@/components/leaderboard/LeaderboardHeader';
import { User } from '@/types/users';
import { fetchLeaderboard } from '@/services/leaderboardService';

export default function LeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFrame, setTimeFrame] = useState<'daily' | 'weekly' | 'allTime'>(
    'allTime'
  );
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);

  useEffect(() => {
    async function loadLeaderboardData() {
      setIsLoading(true);
      setError(null);
      try {
        const {
          data,
          error,
          currentUserRank: userRank,
        } = await fetchLeaderboard(timeFrame, subjectFilter);

        if (error) {
          logger.error('Error in leaderboard data:', error);
          setError('Failed to load leaderboard data. Please try again later.');
          return;
        }

        if (data && data.length > 0) {
          setLeaderboardData(data);
          setCurrentUserRank(userRank);
        } else {
          // Handle empty data case
          setLeaderboardData([]);
          setError(
            'No leaderboard data available. Be the first to complete a quiz!'
          );
        }
      } catch (error) {
        console.error('Unhandled error in leaderboard:', error);
        logger.error('Error fetching leaderboard data:', error);
        setError('An unexpected error occurred. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    loadLeaderboardData();
  }, [timeFrame, subjectFilter]);

  const handleTimeFrameChange = (value: 'daily' | 'weekly' | 'allTime') => {
    setTimeFrame(value);
  };

  const handleSubjectFilterChange = (subjectId: string | null) => {
    setSubjectFilter(subjectId);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <LeaderboardHeader currentUserRank={currentUserRank} />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl">
        <LeaderboardFilters
          timeFrame={timeFrame}
          onTimeFrameChange={handleTimeFrameChange}
          subjectFilter={subjectFilter}
          onSubjectFilterChange={handleSubjectFilterChange}
        />{' '}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
            <div className="mt-4">
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Loading leaderboard...
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                This may take a moment
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16 px-4">
            <div className="inline-flex h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/20 items-center justify-center mb-4">
              <svg
                className="h-10 w-10 text-red-500 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">
              {error}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {error.includes('No leaderboard data')
                ? 'Complete quizzes to appear on the leaderboard and compete with other students!'
                : 'There was a problem loading the leaderboard data. Please try again later.'}
            </p>{' '}
            <button
              onClick={() => setTimeFrame(timeFrame)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg dark:bg-blue-700 dark:hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="fade-in animate-fadeIn">
            <LeaderboardTable data={leaderboardData} timeFrame={timeFrame} />
            <div className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
              Showing top {leaderboardData.length} students • Last updated:{' '}
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
