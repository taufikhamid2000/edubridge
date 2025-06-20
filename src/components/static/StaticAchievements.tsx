import React from 'react';
import Link from 'next/link';

interface Achievement {
  title: string;
  description: string;
  bgColor: string;
}

interface StaticAchievementsProps {
  achievements: Achievement[];
}

const StaticAchievements = ({ achievements }: StaticAchievementsProps) => {
  return (
    <section className="dashboard-section achievements bg-gray-800 dark:bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md text-gray-200 dark:text-gray-800">
      <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
        Recent Achievements
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
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
        ))}
      </div>
      <div className="mt-4 text-center">
        <Link
          href="/static/leaderboard"
          className="inline-block px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full text-sm font-medium transition-colors dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800"
        >
          🏆 View Leaderboard
        </Link>
      </div>
    </section>
  );
};

export default StaticAchievements;
