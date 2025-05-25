import Link from 'next/link';
import { UserDetail } from './types';

interface UserHeaderProps {
  user: UserDetail;
  onStatusChange: (status: 'active' | 'suspended') => void;
}

export default function UserHeader({ user, onStatusChange }: UserHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <Link
          href="/admin/users"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-2 inline-flex items-center"
        >
          ← Back to Users
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {user.display_name}
        </h1>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onStatusChange('active')}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Activate
        </button>
        <button
          onClick={() => onStatusChange('suspended')}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Suspend
        </button>
      </div>
    </div>
  );
}
