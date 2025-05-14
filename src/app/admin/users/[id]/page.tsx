'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import AdminNavigation from '@/components/admin/AdminNavigation';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

interface Achievement {
  id: string;
  name: string;
  title: string;
  description?: string;
  icon_url?: string;
  user_id: string;
  earned_at: string;
  created_at: string;
}

interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  completed: boolean;
  created_at: string;
  quiz_title?: string;
  subject?: string;
  topic?: string;
  time_taken?: number;
}

interface UserDetail {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  level: number;
  xp: number;
  streak: number;
  daily_xp: number;
  weekly_xp: number;
  created_at: string;
  role: string;
  last_login: string;
  achievements: Achievement[];
  quiz_history: QuizAttempt[];
}

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = params?.id || '';

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'achievements' | 'quizzes' | 'activity'
  >('overview');

  useEffect(() => {
    if (!userId) {
      router.push('/admin/users');
      return;
    }

    fetchUserDetails(userId);
  }, [userId, router]);

  async function fetchUserDetails(id: string) {
    try {
      setLoading(true);

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) {
        throw profileError;
      } // Fetch user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', id)
        .single();

      if (roleError) {
        logger.warn('Error fetching user role:', roleError);
        // Continue execution, as this is non-critical
      }

      // Fetch achievements
      const { data: achievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', id);

      if (achievementsError) {
        logger.warn('Error fetching achievements:', achievementsError);
        // Continue execution, as this is non-critical
      }

      // Fetch quiz history (assuming you have a quiz_attempts table)
      const { data: quizHistory, error: quizError } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false });

      if (quizError) {
        logger.warn('Error fetching quiz history:', quizError);
        // Continue execution, as this is non-critical
      }

      // Combine all data
      setUser({
        ...profile,
        role: roleData?.role || 'user',
        last_login: 'Not available', // This would come from auth.users which might not be directly accessible
        achievements: achievements || [],
        quiz_history: quizHistory || [],
      });
    } catch (error) {
      logger.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUserStatusChange(status: 'active' | 'suspended') {
    try {
      // In a real app, you would update the user's status in your database
      // For now, we'll just log the action
      logger.log(`Admin action: Set user ${userId} status to ${status}`);

      // Optionally update the local state
      if (user) {
        setUser({
          ...user,
          status: status,
        } as UserDetail);
      }
    } catch (error) {
      logger.error('Error updating user status:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <AdminNavigation />
          <div className="flex-1 p-8 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <AdminNavigation />
          <div className="flex-1 p-8">
            <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4">
              <h2 className="text-xl font-bold mb-2">User Not Found</h2>
              <p className="mb-4">
                The user you are looking for does not exist or has been deleted.
              </p>
              <Link
                href="/admin/users"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Return to User List
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminNavigation />
        <div className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <Link
                href="/admin/users"
                className="text-blue-600 hover:text-blue-800 mb-2 inline-flex items-center"
              >
                ← Back to Users
              </Link>
              <h1 className="text-3xl font-bold">{user.display_name}</h1>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleUserStatusChange('active')}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Activate
              </button>
              <button
                onClick={() => handleUserStatusChange('suspended')}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Suspend
              </button>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg mb-6">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-24 w-24">
                  {' '}
                  {user.avatar_url ? (
                    <Image
                      className="h-24 w-24 rounded-full object-cover"
                      src={user.avatar_url}
                      alt={user.display_name}
                      width={96}
                      height={96}
                      unoptimized={user.avatar_url.startsWith('data:')}
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600 text-3xl font-medium">
                        {user.display_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-6">
                  <h2 className="text-2xl font-bold">{user.display_name}</h2>
                  <p className="text-gray-500">{user.email}</p>
                  <div className="flex mt-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 mr-2">
                      {user.role}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      Level {user.level}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('achievements')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'achievements'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Achievements
                </button>
                <button
                  onClick={() => setActiveTab('quizzes')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'quizzes'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Quiz History
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'activity'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Activity Log
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    User Statistics
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">
                        Experience Points
                      </div>
                      <div className="text-2xl font-bold">{user.xp} XP</div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">
                        Current Streak
                      </div>
                      <div className="text-2xl font-bold">
                        {user.streak} days
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">
                        Member Since
                      </div>
                      <div className="text-2xl font-bold">
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-md font-medium text-gray-900 mb-2">
                        Weekly Activity
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg h-48 flex items-center justify-center">
                        <p className="text-gray-500">
                          Activity chart will be displayed here
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-md font-medium text-gray-900 mb-2">
                        Subject Performance
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg h-48 flex items-center justify-center">
                        <p className="text-gray-500">
                          Performance chart will be displayed here
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'achievements' && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    User Achievements
                  </h2>

                  {user.achievements.length === 0 ? (
                    <p className="text-gray-500 py-4">
                      This user has not earned any achievements yet.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {user.achievements.map((achievement) => (
                        <div
                          key={achievement.id}
                          className="border rounded-lg p-4"
                        >
                          <div className="flex items-center mb-2">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-blue-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                                />
                              </svg>
                            </div>
                            <div>
                              <h3 className="font-medium">
                                {achievement.title}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {achievement.description}
                              </p>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            Earned on{' '}
                            {new Date(
                              achievement.created_at
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-6">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                      Award Achievement
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'quizzes' && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Quiz History
                  </h2>

                  {user.quiz_history.length === 0 ? (
                    <p className="text-gray-500 py-4">
                      This user has not attempted any quizzes yet.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Quiz
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Score
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Time Taken
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {user.quiz_history.map((quiz) => (
                            <tr key={quiz.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {quiz.quiz_title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {quiz.subject} - {quiz.topic}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(quiz.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {quiz.score}%
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {quiz.time_taken} seconds
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'activity' && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Activity Log
                  </h2>
                  <p className="text-gray-500 py-4">
                    User activity log functionality will be implemented soon.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
