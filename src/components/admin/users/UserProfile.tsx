import Image from 'next/image';
import { UserDetail } from './types';

interface UserProfileProps {
  user: UserDetail;
}

export default function UserProfile({ user }: UserProfileProps) {
  return (
    <div className="bg-gray-800 dark:bg-white shadow rounded-lg mb-6">
      <div className="p-6 border-b border-gray-700 dark:border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-24 w-24">
            {user?.avatar_url ? (
              <Image
                className="h-24 w-24 rounded-full object-cover"
                src={user.avatar_url}
                alt={user.display_name || ''}
                width={96}
                height={96}
                unoptimized={user.avatar_url.startsWith('data:')}
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                <span className="text-gray-600 dark:text-gray-300 text-3xl font-medium">
                  {user?.display_name
                    ? user.display_name.charAt(0).toUpperCase()
                    : '?'}
                </span>
              </div>
            )}
          </div>
          <div className="ml-6">
            <h2 className="text-2xl font-bold text-white dark:text-gray-900">
              {user?.display_name || 'Unknown User'}
            </h2>
            <p className="text-gray-400 dark:text-gray-500">
              {user?.email || 'No email available'}
            </p>
            <div className="flex mt-2">
              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 mr-2">
                {user.role}
              </span>
              <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300">
                Level {user.level}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
