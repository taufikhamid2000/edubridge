'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { User, Achievement } from '@/types/users';

// Extended User type to include guest user properties
interface ExtendedUser extends User {
  isGuest?: boolean;
}
import {
  fetchUserProfileAPI,
  fetchUserProfileByIdAPI,
  fetchUserAchievementsAPI,
  fetchUserCreatedQuizzesAPI,
  QuizWithSubject,
} from '@/services/profileService';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfileAchievements from '@/components/profile/ProfileAchievements';
import ProfileSettings from '@/components/profile/ProfileSettings';
import QuizTable from '@/components/topic/QuizTable';

function ProfileContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId'); // Get userId from query params
  const [activeTab, setActiveTab] = useState<
    'stats' | 'achievements' | 'settings' | 'created-quizzes'
  >('stats');

  // Fetch user profile with React Query
  const {
    data: user,
    isLoading: isUserLoading,
    error: userError,
  } = useQuery<User>({
    queryKey: ['profile', userId || 'me'],
    queryFn: () =>
      userId ? fetchUserProfileByIdAPI(userId) : fetchUserProfileAPI(),
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes cache
    retry: 2,
  });

  // Fetch user achievements with React Query
  const {
    data: achievements,
    isLoading: isAchievementsLoading,
    error: achievementsError,
  } = useQuery<Achievement[]>({
    queryKey: ['achievements', userId || 'me'],
    queryFn: () => fetchUserAchievementsAPI(userId || 'me'),
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes cache
    retry: 2,
  });

  // Fetch user created quizzes with React Query
  const {
    data: createdQuizzes,
    isLoading: isQuizzesLoading,
    error: quizzesError,
  } = useQuery<QuizWithSubject[]>({
    queryKey: ['created-quizzes', userId || 'me'],
    queryFn: () => fetchUserCreatedQuizzesAPI(userId || 'me'),
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes cache    retry: 2,
  });

  // Determine if this is the user's own profile
  const isOwnProfile = !userId || (user && !(user as ExtendedUser).isGuest);

  // Check if any data is loading
  const isLoading = isUserLoading || isAchievementsLoading || isQuizzesLoading;

  // Check for errors
  const hasError = userError || achievementsError || quizzesError;

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (hasError || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-500 mb-4">
              Error
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {(userError || achievementsError || quizzesError)?.message ||
                'Failed to load profile. Please try again.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header with Avatar and Basic Info */}
        <ProfileHeader user={user} />

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg mt-6 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              <button
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'stats'
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('stats')}
              >
                Stats & Progress
              </button>
              <button
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'achievements'
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('achievements')}
              >
                Achievements
              </button>
              <button
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'created-quizzes'
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('created-quizzes')}
              >
                Created Quizzes
              </button>
              {isOwnProfile && (
                <button
                  className={`px-6 py-4 text-sm font-medium ${
                    activeTab === 'settings'
                      ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('settings')}
                >
                  Settings
                </button>
              )}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'stats' && <ProfileStats user={user} />}{' '}
            {activeTab === 'achievements' && (
              <ProfileAchievements
                achievements={achievements || []}
                loading={isLoading}
              />
            )}
            {activeTab === 'created-quizzes' && (
              <QuizTable
                quizzes={createdQuizzes || []}
                showCreator={false}
                showActions={true}
                title={
                  isOwnProfile ? 'Your Created Quizzes' : 'Created Quizzes'
                }
                emptyMessage={
                  isOwnProfile
                    ? "You haven't created any quizzes yet. Start creating quizzes to see them here!"
                    : "This user hasn't created any quizzes yet."
                }
                getQuizLink={(quiz) =>
                  `/quiz/${quiz.subject_slug}/${quiz.topic_id}`
                }
                renderActions={(quiz) => (
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => {
                        window.open(
                          `/quiz/${quiz.subject_slug}/${quiz.topic_id}`,
                          '_blank'
                        );
                      }}
                      className="px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 border border-blue-300 dark:border-blue-600 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      View Topic
                    </button>
                    {isOwnProfile && (
                      <button
                        onClick={() => {
                          // TODO: Add edit functionality
                          console.log('Edit quiz:', quiz.id);
                        }}
                        className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                )}
              />
            )}
            {activeTab === 'settings' && isOwnProfile && (
              <ProfileSettings user={user} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
