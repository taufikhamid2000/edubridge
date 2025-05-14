import React from 'react';

interface WeeklyProgressProps {
  quizzesCompleted: number;
  quizzesTotal: number;
  averageScore: number;
}

const WeeklyProgress = ({
  quizzesCompleted,
  quizzesTotal,
  averageScore,
}: WeeklyProgressProps) => {
  const quizCompletionPercentage = Math.round(
    (quizzesCompleted / quizzesTotal) * 100
  );

  return (
    <section className="dashboard-section progress bg-gray-100 p-3 sm:p-4 md:p-6 rounded-lg shadow-md dark:bg-gray-800 dark:text-gray-200">
      <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
        Weekly Progress
      </h2>
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm sm:text-base">Quizzes This Week</span>
          <div className="w-2/3 bg-gray-300 rounded-full h-3 sm:h-4 dark:bg-gray-700">
            <div
              className="bg-blue-500 h-3 sm:h-4 rounded-full"
              style={{ width: `${quizCompletionPercentage}%` }}
            ></div>
          </div>
          <span className="text-sm sm:text-base">
            {quizzesCompleted}/{quizzesTotal}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm sm:text-base">Average Score</span>
          <div className="w-2/3 bg-gray-300 rounded-full h-3 sm:h-4 dark:bg-gray-700">
            <div
              className="bg-green-500 h-3 sm:h-4 rounded-full"
              style={{ width: `${averageScore}%` }}
            ></div>
          </div>
          <span className="text-sm sm:text-base">{averageScore}%</span>
        </div>{' '}
      </div>
      <div className="mt-4 text-right">
        <a
          href="/leaderboard"
          className="text-sm text-blue-600 hover:underline dark:text-blue-400 inline-flex items-center"
        >
          See how you rank <span className="ml-1">→</span>
        </a>
      </div>
    </section>
  );
};

export default WeeklyProgress;
