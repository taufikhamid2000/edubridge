import Link from 'next/link';

interface LeaderboardNavProps {
  activeTab: 'students' | 'schools';
  isStatic?: boolean;
}

export default function LeaderboardNav({
  activeTab,
  isStatic = false,
}: LeaderboardNavProps) {
  return (
    <div className="mb-8">
      <div className="border-b border-gray-700 dark:border-gray-200">
        <nav
          className="-mb-px flex space-x-8"
          aria-label="Leaderboard navigation"
        >
          <Link
            href={isStatic ? '/static/leaderboard' : '/leaderboard'}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'students'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Student Rankings
          </Link>
          <Link
            href={
              isStatic ? '/static/leaderboard/schools' : '/leaderboard/schools'
            }
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'schools'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
          >
            School Rankings
          </Link>
        </nav>
      </div>
    </div>
  );
}
