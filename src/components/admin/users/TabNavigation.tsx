export type TabType = 'overview' | 'achievements' | 'quizzes' | 'activity';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function TabNavigation({
  activeTab,
  onTabChange,
}: TabNavigationProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="-mb-px flex">
        <button
          onClick={() => onTabChange('overview')}
          className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
            activeTab === 'overview'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => onTabChange('achievements')}
          className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
            activeTab === 'achievements'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          Achievements
        </button>
        <button
          onClick={() => onTabChange('quizzes')}
          className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
            activeTab === 'quizzes'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          Quiz History
        </button>
        <button
          onClick={() => onTabChange('activity')}
          className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
            activeTab === 'activity'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          Activity Log
        </button>
      </nav>
    </div>
  );
}
