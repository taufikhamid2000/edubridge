import React from 'react';

interface Achievement {
  title: string;
  description: string;
  bgColor: string;
}

interface AchievementsProps {
  achievements: Achievement[];
  isStatic?: boolean;
}

const Achievements = ({
  achievements,
  isStatic = false,
}: AchievementsProps) => {
  const leaderboardPath = isStatic ? '/static/leaderboard' : '/leaderboard';

  return (
    <section className="dashboard-section achievements bg-gray-800 dark:bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md text-gray-200 dark:text-gray-800">
      <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
        Recent Achievements
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {' '}
        {achievements.map((achievement, index) => (
          <div
            key={index}
            className={`achievement-card ${achievement.bgColor} p-3 sm:p-4 rounded-lg shadow dark:bg-opacity-70`}
          >
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-900">
              {achievement.title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-700">
              {achievement.description}
            </p>
          </div>
        ))}{' '}
      </div>{' '}
      <div className="mt-4 text-center">
        <a
          href={leaderboardPath}
          className="inline-block px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full text-sm font-medium transition-colors dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800"
        >
          🏆 View Leaderboard
        </a>
      </div>
    </section>
  );
};

export default Achievements;
