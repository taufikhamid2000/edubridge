import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
  email: string;
  display_name?: string;
  streak: number;
  xp: number;
  level: number;
  lastQuizDate: string;
}

interface WelcomeBannerProps {
  user: User | null;
}

const WelcomeBanner = ({ user }: WelcomeBannerProps) => {
  const router = useRouter();

  if (!user) return null;

  return (
    <section className="dashboard-section welcome bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          Welcome back, {user.display_name || user.email.split('@')[0]}
          {!user.display_name && (
            <Link href="/profile" className="inline-block ml-4">
              <button className="text-sm bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded transition-colors">
                Set username
              </button>
            </Link>
          )}
        </h1>
        <p className="text-base sm:text-lg">
          Ready to continue your learning journey?
        </p>{' '}
        <p className="mt-4 text-sm sm:text-base">
          Your current streak: <strong>{user.streak} days</strong>
        </p>{' '}
        <div className="mt-6 flex items-center space-x-4">
          <a
            href="/leaderboard"
            className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 transition-all rounded-lg text-sm font-medium"
          >
            <span className="mr-2">🏆</span>
            View Leaderboard
          </a>{' '}
          <button
            onClick={async () => {
              try {
                const response = await fetch('/api/quizzes/random');
                const data = await response.json();

                if (!response.ok) throw new Error(data.error);
                router.push(
                  `/quiz/${data.subject_slug}/${data.topic_id}/play/${data.quiz_id}`
                );
              } catch (error) {
                console.error('Error fetching random quiz:', error);
                alert('Failed to find a random quiz. Please try again later.');
              }
            }}
            className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 transition-all rounded-lg text-sm font-medium"
          >
            <span className="mr-2">🎯</span>
            Try Random Quiz
          </button>
          <button
            onClick={async () => {
              try {
                const response = await fetch('/api/topics/random');
                const data = await response.json();

                if (!response.ok) throw new Error(data.error);
                router.push(`/quiz/${data.subject_slug}/${data.topic_id}`);
              } catch (error) {
                console.error('Error fetching random topic:', error);
                alert('Failed to find a random topic. Please try again later.');
              }
            }}
            className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 transition-all rounded-lg text-sm font-medium"
          >
            <span className="mr-2">🎲</span>
            Explore Random Topic
          </button>
        </div>
      </div>
    </section>
  );
};

export default WelcomeBanner;
