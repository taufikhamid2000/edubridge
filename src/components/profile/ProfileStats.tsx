import React from 'react';
import { User } from '@/types/users';

interface ProfileStatsProps {
  user: User;
}

export default function ProfileStats({ user }: ProfileStatsProps) {
  // Calculate progress to next level (simplified calculation)
  const xpForCurrentLevel = user.level * 100;
  const xpForNextLevel = (user.level + 1) * 100;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const currentProgress = user.xp - xpForCurrentLevel;
  const progressPercentage = Math.min(
    100,
    Math.round((currentProgress / xpNeeded) * 100)
  );

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Your Learning Journey</h2>{' '}
      {/* XP and Level Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-300 dark:text-gray-700">
            Level Progress: {currentProgress}/{xpNeeded} XP to Level{' '}
            {user.level + 1}
          </span>
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
            {progressPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-700 dark:bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 dark:bg-white p-6 rounded-lg border border-gray-700 dark:border-gray-200 shadow-sm">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {user.xp.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Total XP Earned
          </div>
        </div>{' '}
        <div className="bg-gray-800 dark:bg-white p-6 rounded-lg border border-gray-700 dark:border-gray-200 shadow-sm">
          <div className="text-3xl font-bold text-orange-500 dark:text-orange-400">
            {user.streak}
          </div>
          <div className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Day Streak
          </div>
        </div>
        <div className="bg-gray-800 dark:bg-white p-6 rounded-lg border border-gray-700 dark:border-gray-200 shadow-sm">
          <div className="text-3xl font-bold text-green-600 dark:text-green-500">
            {user.level}
          </div>
          <div className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Current Level
          </div>
        </div>
      </div>
      {/* Recent Activity Placeholder */}
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4 dark:text-gray-200">
          Recent Activity
        </h3>
        {user.lastQuizDate ? (
          <p className="text-gray-600 dark:text-gray-300">
            Last quiz completed on{' '}
            {new Date(user.lastQuizDate).toLocaleDateString()}
          </p>
        ) : (
          <p className="text-gray-400 dark:text-gray-500 italic">
            No recent activity
          </p>
        )}
      </div>
    </div>
  );
}
