import { Achievement } from '../types';

interface AchievementsTabProps {
  achievements: Achievement[];
  onAwardClick: () => void;
}

export default function AchievementsTab({
  achievements,
  onAwardClick,
}: AchievementsTabProps) {
  return (
    <div>
      <h2 className="text-lg font-medium text-white dark:text-gray-900 mb-4">
        User Achievements
      </h2>
      {!achievements || achievements.length === 0 ? (
        <p className="text-gray-400 dark:text-gray-500 py-4">
          This user has not earned any achievements yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="border dark:border-gray-700 rounded-lg p-4 dark:bg-gray-800"
            >
              <div className="flex items-center mb-2">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-500 dark:text-blue-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-white dark:text-gray-900">
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    {achievement.description}
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                Earned on{' '}
                {new Date(achievement.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-6">
        <button
          onClick={onAwardClick}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          Award Achievement
        </button>
      </div>
    </div>
  );
}
