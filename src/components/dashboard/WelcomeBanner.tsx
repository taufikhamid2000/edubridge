import React from 'react';

interface User {
  email: string;
  streak: number;
  xp: number;
  level: number;
  lastQuizDate: string;
}

interface WelcomeBannerProps {
  user: User | null;
}

const WelcomeBanner = ({ user }: WelcomeBannerProps) => {
  if (!user) return null;

  return (
    <section className="dashboard-section welcome bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          Welcome back, {user.email}
        </h1>
        <p className="text-base sm:text-lg">
          Ready to continue your learning journey?
        </p>
        <p className="mt-4 text-sm sm:text-base">
          Your current streak: <strong>{user.streak} days</strong>
        </p>
      </div>
    </section>
  );
};

export default WelcomeBanner;
