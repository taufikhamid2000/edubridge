import React from 'react';
import Image from 'next/image';
import { Achievement } from '@/types/users';

interface ProfileAchievementsProps {
  achievements: Achievement[];
  loading?: boolean;
}

export default function ProfileAchievements({
  achievements,
  loading = false,
}: ProfileAchievementsProps) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-12 w-2/3 mx-auto bg-gray-700 dark:bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 bg-gray-700 dark:bg-gray-200 rounded"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (achievements.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
          <svg
            className="h-12 w-12 text-gray-400 dark:text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="mt-2 text-lg font-medium text-white dark:text-gray-900">
          No achievements yet
        </h3>
        <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
          Complete quizzes and challenges to earn your first achievement!
        </p>
      </div>
    );
  }
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 dark:text-white">
        Your Achievements
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className="bg-gray-800 dark:bg-white p-4 border border-gray-700 dark:border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 h-12 w-12">
                {achievement.icon.startsWith('http') ? (
                  <Image
                    src={achievement.icon}
                    width={48}
                    height={48}
                    alt={achievement.title}
                    className="h-12 w-12"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                    {achievement.icon.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>{' '}
              <div className="ml-4">
                <h3 className="font-medium text-white dark:text-gray-900">
                  {achievement.title}
                </h3>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  {achievement.description}
                </p>
                {/* Show progress bar if applicable */}
                {achievement.progress !== undefined &&
                  achievement.max_progress !== undefined && (
                    <div className="mt-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {achievement.progress}/{achievement.max_progress}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 dark:bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              (achievement.progress /
                                achievement.max_progress) *
                                100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}{' '}
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Earned on{' '}
                  {new Date(achievement.earned_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
