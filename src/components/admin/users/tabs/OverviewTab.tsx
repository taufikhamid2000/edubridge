import { UserDetail } from '../types';

interface OverviewTabProps {
  user: UserDetail;
}

export default function OverviewTab({ user }: OverviewTabProps) {
  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        User Statistics
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Experience Points
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {user?.xp || 0} XP
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Current Streak
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {user?.streak || 0} days
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Member Since
          </div>{' '}
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {' '}
            {user?.created_at
              ? new Date(user.created_at).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })
              : 'N/A'}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
            Weekly Activity
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg h-48 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              Activity chart will be displayed here
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
            Subject Performance
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg h-48 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              Performance chart will be displayed here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
