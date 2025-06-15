'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';
import LeaderboardFilters from '@/components/leaderboard/LeaderboardFilters';
import LeaderboardHeader from '@/components/leaderboard/LeaderboardHeader';
import LeaderboardNav from '@/components/leaderboard/LeaderboardNav';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { User } from '@/types/users';

interface LeaderboardResponse {
  data: User[];
  currentUserRank: number | null;
}

async function fetchLeaderboardData(
  timeFrame: string
): Promise<LeaderboardResponse> {
  const response = await fetch(`/api/leaderboard?timeFrame=${timeFrame}`);
  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard data');
  }
  return response.json();
}

export default function LeaderboardPage() {
  const [timeFrame, setTimeFrame] = useState<'daily' | 'weekly' | 'allTime'>(
    'allTime'
  );
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);

  const { data, isLoading, error, dataUpdatedAt, refetch } = useQuery({
    queryKey: ['leaderboard', timeFrame],
    queryFn: () => fetchLeaderboardData(timeFrame),
    staleTime: 60000, // Consider data fresh for 1 minute
    gcTime: 300000, // Keep data in cache for 5 minutes
    refetchInterval: 60000, // Auto-refresh every minute
  });

  const handleTimeFrameChange = (value: 'daily' | 'weekly' | 'allTime') => {
    setTimeFrame(value);
  };

  const handleSubjectFilterChange = (subjectId: string | null) => {
    setSubjectFilter(subjectId);
  };

  const errorMessage =
    error instanceof Error ? error.message : 'An unexpected error occurred';
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : new Date();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <LeaderboardNav activeTab="students" />
      <LeaderboardHeader currentUserRank={data?.currentUserRank ?? null} />

      <div className="bg-gray-800 dark:bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-700 dark:border-gray-200 transition-all duration-300 hover:shadow-xl">
        <LeaderboardFilters
          timeFrame={timeFrame}
          onTimeFrameChange={handleTimeFrameChange}
          subjectFilter={subjectFilter}
          onSubjectFilterChange={handleSubjectFilterChange}
        />
        {isLoading ? (
          <SkeletonLoader
            variant="table"
            rows={10}
            cols={3}
            message="Loading leaderboard... This may take a moment"
            showStopwatch={true}
          />
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
            <p className="text-xl font-medium text-gray-200 dark:text-gray-800 mb-2">
              {errorMessage}
            </p>
            <p className="text-gray-400 dark:text-gray-600 mb-6 max-w-md mx-auto">
              {errorMessage.includes('No leaderboard data')
                ? 'Complete quizzes to appear on the leaderboard and compete with other students!'
                : 'There was a problem loading the leaderboard data. Please try again later.'}
            </p>
            <button
              onClick={() => refetch()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg dark:bg-blue-700 dark:hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="fade-in animate-fadeIn">
            <LeaderboardTable data={data?.data || []} timeFrame={timeFrame} />
            <div className="text-center mt-6 text-sm text-gray-400 dark:text-gray-500">
              Showing top {data?.data.length || 0} students • Last updated:{' '}
              {lastUpdated.toLocaleTimeString()} • Auto-refreshing every minute
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
