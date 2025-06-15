'use client';

import React, { useEffect, useState } from 'react';
import { fetchUserStats } from '@/services/dashboardService';
import Link from 'next/link';

interface WeeklyProgressProps {
  initialData?: {
    quizzesCompleted: number;
    quizzesTotal: number;
    averageScore: number;
  };
  isStatic?: boolean;
}

const EnhancedWeeklyProgress = ({
  initialData,
  isStatic = false,
}: WeeklyProgressProps) => {
  const [progressData, setProgressData] = useState(
    initialData || {
      quizzesCompleted: 0,
      quizzesTotal: 10,
      averageScore: 0,
    }
  );
  const [isLoading, setIsLoading] = useState(!initialData);

  // Fetch progress data if not provided or if it seems to be guest data
  useEffect(() => {
    const fetchProgressData = async () => {
      // Only fetch if not static and either no initial data or appears to be guest data (0 quizzes)
      if (!isStatic && (!initialData || initialData.quizzesCompleted === 0)) {
        console.log('EnhancedWeeklyProgress: Fetching user stats directly');
        try {
          const userData = await fetchUserStats();
          if (userData && userData.weeklyProgress) {
            console.log(
              'EnhancedWeeklyProgress: Got progress data:',
              userData.weeklyProgress
            );
            setProgressData(userData.weeklyProgress);
          }
        } catch (error) {
          console.error('Error fetching user progress data:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchProgressData();
  }, [initialData, isStatic]);

  const { quizzesCompleted, quizzesTotal, averageScore } = progressData;
  const quizCompletionPercentage =
    quizzesTotal > 0 ? Math.round((quizzesCompleted / quizzesTotal) * 100) : 0;

  if (isLoading) {
    return (
      <section className="dashboard-section progress bg-gray-800 dark:bg-gray-100 p-3 sm:p-4 md:p-6 rounded-lg shadow-md text-gray-200 dark:text-gray-800">
        <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
          Weekly Progress
        </h2>
        <div className="animate-pulse flex flex-col gap-3 sm:gap-4">
          <div className="h-4 bg-gray-700 dark:bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-700 dark:bg-gray-300 rounded w-full"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-section progress bg-gray-800 dark:bg-gray-100 p-3 sm:p-4 md:p-6 rounded-lg shadow-md text-gray-200 dark:text-gray-800">
      <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
        Weekly Progress
      </h2>
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm sm:text-base">Quizzes This Week</span>
          <div className="w-2/3 bg-gray-700 dark:bg-gray-300 rounded-full h-3 sm:h-4">
            <div
              className="bg-blue-500 h-3 sm:h-4 rounded-full"
              style={{ width: `${quizCompletionPercentage}%` }}
            ></div>
          </div>
          <span className="text-sm sm:text-base">
            {quizzesCompleted}/{quizzesTotal}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm sm:text-base">Average Score</span>
          <div className="w-2/3 bg-gray-700 dark:bg-gray-300 rounded-full h-3 sm:h-4">
            <div
              className="bg-green-500 h-3 sm:h-4 rounded-full"
              style={{ width: `${averageScore}%` }}
            ></div>
          </div>
          <span className="text-sm sm:text-base">{averageScore}%</span>
        </div>{' '}
      </div>
      <div className="mt-4 text-right">
        <Link
          href={isStatic ? '/static/leaderboard' : '/leaderboard'}
          className="text-sm text-blue-600 hover:underline dark:text-blue-400 inline-flex items-center"
        >
          See how you rank <span className="ml-1">→</span>
        </Link>
      </div>
    </section>
  );
};

export default EnhancedWeeklyProgress;
