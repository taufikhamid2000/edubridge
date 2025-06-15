import React from 'react';
import { Achievement } from '@/types/users';

interface AchievementCardProps {
  achievement: Achievement;
  isNew?: boolean;
}

export default function AchievementCard({
  achievement,
  isNew = false,
}: AchievementCardProps) {
  return (
    <div
      className={`relative bg-gray-800 dark:bg-white shadow-md rounded-lg overflow-hidden border ${isNew ? 'border-yellow-400' : 'border-gray-700 dark:border-gray-200'}`}
    >
      {isNew && (
        <div className="absolute top-0 right-0">
          <div className="bg-yellow-400 text-yellow-900 text-xs font-medium px-2 py-0.5 rounded-bl-md">
            NEW!
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center mb-3">
          <div className="w-10 h-10 mr-3 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 text-xl">
            {achievement.icon}
          </div>
          <h3 className="font-bold text-gray-300 dark:text-gray-800">
            {achievement.title}
          </h3>
        </div>

        <p className="text-sm text-gray-400 dark:text-gray-600 mb-3">
          {achievement.description}
        </p>

        {achievement.progress !== undefined &&
          achievement.max_progress !== undefined && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span>Progress</span>
                <span>
                  {achievement.progress}/{achievement.max_progress}
                </span>
              </div>
              <div className="w-full bg-gray-700 dark:bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${(achievement.progress / achievement.max_progress) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          )}

        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Earned on {new Date(achievement.earned_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
