import React from 'react';

interface LeaderboardHeaderProps {
  currentUserRank: number | null;
}

export default function LeaderboardHeader({
  currentUserRank,
}: LeaderboardHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
        🏆 Leaderboard
      </h1>{' '}
      <p className="text-gray-600 dark:text-gray-300 mb-2">
        See how you rank among other students and compete for the top positions!
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Note: The page may take 5-10 seconds to load. If you don&apos;t see any
        rankings, try refreshing the page. If issues persist, clearing your
        browser cache might help. And if nothing else works... maybe it&apos;s
        time for a break! 🌿
      </p>
      {currentUserRank && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-lg p-4 flex items-center">
          <div className="h-10 w-10 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
            {currentUserRank}
          </div>
          <div>
            <p className="font-medium text-blue-800 dark:text-blue-300">
              Your Current Rank
            </p>{' '}
            <p className="text-sm text-blue-600 dark:text-blue-400">
              {currentUserRank <= 10 ? (
                <>You&apos;re in the top 10! 🎉 Keep up the good work!</>
              ) : currentUserRank <= 50 ? (
                <>You&apos;re doing great! Keep learning to climb higher.</>
              ) : (
                <>
                  Complete more quizzes and maintain your streak to improve your
                  rank.
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
