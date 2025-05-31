'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { User, Achievement } from '@/types/users';
import { Quiz } from '@/types/topics';
import {
  fetchUserProfile,
  fetchUserAchievements,
} from '@/services/profileService';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfileAchievements from '@/components/profile/ProfileAchievements';
import ProfileSettings from '@/components/profile/ProfileSettings';
import QuizTable from '@/components/topic/QuizTable';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

function ProfileContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId'); // Get userId from query params
  const [user, setUser] = useState<User | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [createdQuizzes, setCreatedQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'stats' | 'achievements' | 'settings' | 'created-quizzes'
  >('stats');

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);
        // Check if user is logged in
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          setError('You need to be logged in to view profiles.');
          setLoading(false);
          return;
        }

        const targetUserId = userId || data.session.user.id;
        setIsOwnProfile(targetUserId === data.session.user.id);

        // Fetch user profile data
        let userData, userError;
        if (userId) {
          // Fetch specific user profile
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single();
          userData = data;
          userError = error;
        } else {
          // Fetch current user profile
          const result = await fetchUserProfile();
          userData = result.data;
          userError = result.error;
        }

        if (userError) {
          setError(`Failed to load profile data: ${userError.message}`);
          logger.error('Profile data fetch error:', userError);
          setLoading(false);
          return;
        }

        if (!userData) {
          setError('No profile data returned. Please try again.');
          setLoading(false);
          return;
        }

        // Format the data to match User type if we fetched directly from Supabase
        if (userId) {
          const formattedUser: User = {
            id: userData.id,
            email:
              userData.email ||
              `user-${userData.id.substring(0, 8)}@example.com`,
            display_name: userData.display_name || '',
            avatar_url: userData.avatar_url || '',
            streak: userData.streak || 0,
            xp: userData.xp || 0,
            level: userData.level || 1,
            lastQuizDate: userData.last_quiz_date,
            created_at: userData.created_at,
          };
          setUser(formattedUser);
        } else {
          setUser(userData);
        }

        // Fetch user achievements
        let achievementsData, achievementsError;
        if (userId) {
          // Fetch specific user achievements
          const { data, error } = await supabase
            .from('achievements')
            .select('*')
            .eq('user_id', userId)
            .order('earned_at', { ascending: false });
          achievementsData = data;
          achievementsError = error;
        } else {
          // Fetch current user achievements
          const result = await fetchUserAchievements();
          achievementsData = result.data;
          achievementsError = result.error;
        }

        if (achievementsError) {
          logger.error('Achievements fetch error:', achievementsError);
          // We'll continue even if achievements fail to load
        }
        setAchievements(achievementsData || []);

        // Fetch user created quizzes with subject slug for proper URL generation
        const targetUserIdForQuizzes = userId || data.session.user.id;
        const { data: createdQuizzesData, error: createdQuizzesError } =
          await supabase
            .from('quizzes')
            .select(
              `
              *,
              topics!inner(
                id,
                name,
                chapters!inner(
                  id,
                  subjects!inner(
                    slug
                  )
                )
              )
            `
            )
            .eq('created_by', targetUserIdForQuizzes)
            .order('created_at', { ascending: false });

        if (createdQuizzesError) {
          logger.error('Created quizzes fetch error:', createdQuizzesError);
          // We'll continue even if created quizzes fail to load
        }

        // Transform the quiz data to include subject_slug for proper URL generation
        interface QuizWithRelations {
          id: string;
          name: string;
          created_by: string;
          created_at: string;
          verified: boolean;
          topic_id: string;
          topics?: {
            id: string;
            name: string;
            chapters?: {
              id: string;
              subjects?: {
                slug: string;
              };
            };
          };
        }

        const transformedQuizzes = (
          (createdQuizzesData as QuizWithRelations[]) || []
        ).map((quiz) => ({
          ...quiz,
          subject_slug: quiz.topics?.chapters?.subjects?.slug,
          topic_title: quiz.topics?.name,
        }));

        setCreatedQuizzes(transformedQuizzes);
      } catch (err) {
        setError('An unexpected error occurred. Please try again.');
        logger.error('Unexpected error in profile page:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [userId]);

  // Reset tab to 'stats' if viewing someone else's profile and settings tab was active
  useEffect(() => {
    if (!isOwnProfile && activeTab === 'settings') {
      setActiveTab('stats');
    }
  }, [isOwnProfile, activeTab]);

  // Render loading state
  if (loading) {
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
  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-500 mb-4">
              Error
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {error || 'Failed to load profile. Please try again.'}
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
            {activeTab === 'stats' && <ProfileStats user={user} />}
            {activeTab === 'achievements' && (
              <ProfileAchievements
                achievements={achievements}
                loading={loading}
              />
            )}
            {activeTab === 'created-quizzes' && (
              <QuizTable
                quizzes={createdQuizzes}
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
