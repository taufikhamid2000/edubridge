'use client';

import { useEffect, useState } from 'react';
import { User, Achievement } from '@/types/users';
import { Quiz } from '@/types/topics';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfileAchievements from '@/components/profile/ProfileAchievements';
import QuizTable from '@/components/topic/QuizTable';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

interface UserProfilePageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  const [userId, setUserId] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [createdQuizzes, setCreatedQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'stats' | 'achievements' | 'created-quizzes'
  >('stats');

  // Extract userId from async params
  useEffect(() => {
    const extractUserId = async () => {
      const resolvedParams = await params;
      setUserId(resolvedParams.userId);
    };
    extractUserId();
  }, [params]);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!userId) {
        setError('User ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Check if current user is logged in
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          setError('You need to be logged in to view profiles.');
          setLoading(false);
          return;
        }

        // Fetch user profile data
        const { data: userData, error: userError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (userError) {
          setError(`Failed to load profile: ${userError.message}`);
          logger.error('User profile fetch error:', userError);
          setLoading(false);
          return;
        }

        if (!userData) {
          setError('User not found');
          setLoading(false);
          return;
        }

        // Format user data
        const formattedUser: User = {
          id: userData.id,
          email:
            userData.email || `user-${userData.id.substring(0, 8)}@example.com`,
          display_name: userData.display_name || 'Anonymous User',
          avatar_url: userData.avatar_url || '',
          streak: userData.streak || 0,
          xp: userData.xp || 0,
          level: userData.level || 1,
          lastQuizDate: userData.last_quiz_date,
          created_at: userData.created_at,
        };
        setUser(formattedUser);

        // Fetch user achievements
        const { data: achievementsData, error: achievementsError } =
          await supabase.from('achievements').select('*').eq('user_id', userId);

        if (achievementsError) {
          logger.error('Achievements fetch error:', achievementsError);
        } else {
          setAchievements(achievementsData || []);
        } // Fetch created quizzes
        const { data: quizzesData, error: quizzesError } = await supabase
          .from('quizzes')
          .select(
            `
            id,
            name,
            created_at,
            topic_id,
            created_by,
            verified
          `
          )
          .eq('created_by', userId)
          .order('created_at', { ascending: false });

        if (quizzesError) {
          logger.error('Created quizzes fetch error:', quizzesError);
        } else {
          // Map the data to match the Quiz interface
          const formattedQuizzes: Quiz[] = (quizzesData || []).map((quiz) => ({
            id: quiz.id,
            name: quiz.name,
            created_by: quiz.created_by,
            created_at: quiz.created_at,
            verified: quiz.verified,
            topic_id: quiz.topic_id,
          }));
          setCreatedQuizzes(formattedQuizzes);
        }

        setLoading(false);
      } catch (err) {
        setError('An unexpected error occurred');
        logger.error('Profile page error:', err);
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-300 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-gray-300 rounded w-48"></div>
                  <div className="h-4 bg-gray-300 rounded w-32"></div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="h-8 bg-gray-300 rounded w-32 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Profile Not Found
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">User not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <ProfileHeader user={user} />

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {' '}
              {[
                { id: 'stats' as const, label: 'Statistics' },
                { id: 'achievements' as const, label: 'Achievements' },
                { id: 'created-quizzes' as const, label: 'Created Quizzes' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'stats' && <ProfileStats user={user} />}
            {activeTab === 'achievements' && (
              <ProfileAchievements achievements={achievements} />
            )}
            {activeTab === 'created-quizzes' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quizzes Created by {user.display_name || 'This User'}
                </h3>
                {createdQuizzes.length > 0 ? (
                  <QuizTable quizzes={createdQuizzes} showCreator={false} />
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-2">📝</div>
                    <p className="text-gray-600">No quizzes created yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
