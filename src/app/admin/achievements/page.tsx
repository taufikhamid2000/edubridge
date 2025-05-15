'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import AdminNavigation from '@/components/admin/AdminNavigation';
import Image from 'next/image';

interface AchievementRequirement {
  count?: number;
  subject_id?: string;
  streak_days?: number;
  score_percentage?: number;
  quiz_count?: number;
}

interface Achievement {
  id: string;
  achievement_type: string;
  title: string;
  description: string;
  icon_url: string | null;
  xp_reward: number;
  requirements: Record<string, AchievementRequirement>;
  created_at: string;
}

export default function AdminAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  // These state variables are prepared for the edit modal functionality
  // They will be used in a future implementation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_showEditModal, setShowEditModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_currentAchievement, setCurrentAchievement] =
    useState<Achievement | null>(null);

  useEffect(() => {
    fetchAchievements();
  }, []);

  async function fetchAchievements() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setAchievements(data || []);
    } catch (error) {
      logger.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleEditAchievement(achievement: Achievement) {
    setCurrentAchievement(achievement);
    setShowEditModal(true);
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        <AdminNavigation />
        <div className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold dark:text-white">
              Achievement Management
            </h1>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600">
              Create New Achievement
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-4 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Achievement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      XP Reward
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Requirements
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>{' '}
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {achievements.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                      >
                        No achievements found. Create your first achievement to
                        get started.
                      </td>
                    </tr>
                  ) : (
                    achievements.map((achievement) => (
                      <tr key={achievement.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {' '}
                              {achievement.icon_url ? (
                                <Image
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={achievement.icon_url}
                                  alt={achievement.title}
                                  width={40}
                                  height={40}
                                  unoptimized={achievement.icon_url.startsWith(
                                    'data:'
                                  )}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
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
                              )}
                            </div>
                            <div className="ml-4">
                              {' '}
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {achievement.title}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {achievement.description}
                              </div>
                            </div>
                          </div>
                        </td>{' '}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {achievement.achievement_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {achievement.xp_reward} XP
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {achievement.requirements ? (
                            <div className="max-w-xs truncate">
                              {JSON.stringify(achievement.requirements)}
                            </div>
                          ) : (
                            'None'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            className="text-blue-600 hover:text-blue-900 mr-4"
                            onClick={() => handleEditAchievement(achievement)}
                          >
                            Edit
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* This section will show example achievements if none exist */}
          {achievements.length === 0 && !loading && (
            <div className="mt-8 bg-blue-50 border border-blue-200 p-6 rounded-lg">
              <h2 className="text-lg font-medium text-blue-800 mb-2">
                Achievement Examples
              </h2>
              <p className="text-blue-700 mb-4">
                Here are some example achievements you might want to create:
              </p>
              <ul className="list-disc list-inside space-y-2 text-blue-700">
                <li>
                  First Quiz Completed - Awarded when a user completes their
                  first quiz
                </li>
                <li>Perfect Score - Awarded when a user gets 100% on a quiz</li>
                <li>
                  Study Streak - Awarded for completing quizzes 5 days in a row
                </li>
                <li>
                  Subject Master - Awarded for completing all quizzes in a
                  subject
                </li>
                <li>Quiz Creator - Awarded for creating their first quiz</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
