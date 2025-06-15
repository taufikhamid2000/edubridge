'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUserData, DashboardUser } from '@/services/dashboardService';

interface WelcomeBannerProps {
  initialUser?: DashboardUser | null;
  isStatic?: boolean;
}

const EnhancedWelcomeBanner = ({
  initialUser,
  isStatic = false,
}: WelcomeBannerProps) => {
  const router = useRouter();
  const [user, setUser] = useState<DashboardUser | null>(initialUser || null);
  const [isLoading, setIsLoading] = useState(!initialUser);

  // Fetch user data directly if not provided or if it's Guest User
  useEffect(() => {
    const fetchUserData = async () => {
      if (!initialUser || initialUser.display_name === 'Guest User') {
        console.log('EnhancedWelcomeBanner: Fetching user data directly');
        try {
          const userData = await getUserData();
          if (userData) {
            console.log('EnhancedWelcomeBanner: Got user data:', {
              isGuest: userData.display_name === 'Guest User',
              displayName: userData.display_name,
            });
            setUser(userData);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();
  }, [initialUser]);

  if (isLoading) {
    return (
      <section className="dashboard-section welcome bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900">
        <div>
          <p className="text-3xl sm:text-4xl font-bold mb-2">Loading...</p>
        </div>
      </section>
    );
  }

  if (!user) return null;

  const handleRandomQuiz = async () => {
    if (isStatic) {
      router.push('/static/quiz/mathematics/random');
      return;
    }

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
  };

  const handleRandomTopic = async () => {
    if (isStatic) {
      router.push('/static/quiz/mathematics/topics/random');
      return;
    }

    try {
      const response = await fetch('/api/topics/random');
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);
      router.push(`/quiz/${data.subject_slug}/${data.topic_id}`);
    } catch (error) {
      console.error('Error fetching random topic:', error);
      alert('Failed to find a random topic. Please try again later.');
    }
  };

  return (
    <section className="dashboard-section welcome bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          Welcome back, {user.display_name || user.email.split('@')[0]}
          {!user.display_name && (
            <Link
              href={isStatic ? '/static/profile' : '/profile'}
              className="inline-block ml-4"
            >
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
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:space-x-4">
          <Link
            href={isStatic ? '/static/leaderboard' : '/leaderboard'}
            className="inline-flex items-center justify-center px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 transition-all rounded-lg text-sm font-medium"
          >
            <span className="mr-2">🏆</span>
            View Leaderboard
          </Link>
          <button
            onClick={handleRandomQuiz}
            className="inline-flex items-center justify-center px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 transition-all rounded-lg text-sm font-medium"
          >
            <span className="mr-2">🎯</span>
            Try Random Quiz
          </button>
          <button
            onClick={handleRandomTopic}
            className="inline-flex items-center justify-center px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 transition-all rounded-lg text-sm font-medium"
          >
            <span className="mr-2">🔄</span>
            Explore Random Topic
          </button>
        </div>
      </div>
    </section>
  );
};

export default EnhancedWelcomeBanner;
