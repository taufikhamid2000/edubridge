'use client';
// Import dynamic config to optimize build
import './config';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import AdminNavigation from '@/components/admin/AdminNavigation';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

// Import custom hooks
import { useUserDetails } from '@/hooks/admin/useUserDetails';

// Import components
import UserHeader from '@/components/admin/users/UserHeader';
import UserProfile from '@/components/admin/users/UserProfile';
import TabNavigation, { TabType } from '@/components/admin/users/TabNavigation';
import OverviewTab from '@/components/admin/users/tabs/OverviewTab';
import AchievementsTab from '@/components/admin/users/tabs/AchievementsTab';
import QuizHistoryTab from '@/components/admin/users/tabs/QuizHistoryTab';
import ActivityLogTab from '@/components/admin/users/tabs/ActivityLogTab';
import AwardAchievementModal from '@/components/admin/users/modals/AwardAchievementModal';

// Import types
import { Achievement } from '@/components/admin/users/types';

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = params?.id || '';
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  // Use the custom hook for data fetching
  const { user, loading, error, setUser } = useUserDetails(userId);

  // Redirect if no userId
  useEffect(() => {
    if (!userId) {
      router.push('/admin/users');
    }
  }, [userId, router]);

  // Log any data fetching errors
  useEffect(() => {
    if (error) {
      logger.error('Error in user details page:', error.message);
    }
  }, [error]);
  // Handle user status changes (enable/disable)
  async function handleUserStatusChange(isDisabled: boolean) {
    try {
      // Update the user's disabled status in the database
      const { toggleUserDisabled } = await import('@/services/adminService');
      const success = await toggleUserDisabled(userId, isDisabled);

      if (!success) {
        throw new Error(
          `Failed to ${isDisabled ? 'disable' : 'enable'} user account`
        );
      }

      logger.log(
        `Admin action: Set user ${userId} ${isDisabled ? 'disabled' : 'enabled'}`
      );

      // Update the local state
      if (user) {
        setUser({
          ...user,
          is_disabled: isDisabled,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error('Error updating user status:', errorMessage);
    }
  }

  // Handle achievement awards
  async function handleAwardAchievement(formData: {
    title: string;
    description: string;
    earned_at: string;
  }) {
    try {
      if (!formData.title) {
        alert('Please enter an achievement title');
        return;
      }

      const newAchievement = {
        user_id: userId,
        title: formData.title,
        description: formData.description || 'No description provided',
        earned_at: formData.earned_at,
        created_at: new Date().toISOString(),
      };

      // Insert the achievement into the database
      const { data, error } = await supabase
        .from('achievements')
        .insert([newAchievement])
        .select();

      if (error) {
        throw error;
      }

      // Update local state
      if (user && data) {
        setUser({
          ...user,
          achievements: [...user.achievements, data[0] as Achievement],
        });
      }

      setIsAwardModalOpen(false);
    } catch (error) {
      logger.error('Error awarding achievement:', error);
      alert('Failed to award achievement. Please try again.');
    }
  }
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex">
          <AdminNavigation />
          <div className="flex-1 p-8 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex">
          <AdminNavigation />
          <div className="flex-1 p-8">
            <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-lg mb-4">
              <h2 className="text-xl font-bold mb-2">Error</h2>
              <p className="mb-4">
                {error.message ||
                  'An error occurred while loading user details.'}
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex">
          <AdminNavigation />
          <div className="flex-1 p-8">
            <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-lg mb-4">
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        <AdminNavigation />
        <div className="flex-1 p-8">
          {/* Header with back button and user actions */}
          <UserHeader user={user} onStatusChange={handleUserStatusChange} />

          {/* User profile card with avatar and basic details */}
          <UserProfile user={user} />

          {/* Main content with tabs */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="p-6">
              {activeTab === 'overview' && <OverviewTab user={user} />}

              {activeTab === 'achievements' && (
                <AchievementsTab
                  achievements={user.achievements}
                  onAwardClick={() => setIsAwardModalOpen(true)}
                />
              )}

              {activeTab === 'quizzes' && (
                <QuizHistoryTab quizHistory={user.quiz_history} />
              )}

              {activeTab === 'activity' && <ActivityLogTab />}
            </div>
          </div>
        </div>
      </div>

      {/* Achievement award modal */}
      <AwardAchievementModal
        isOpen={isAwardModalOpen}
        onClose={() => setIsAwardModalOpen(false)}
        onAward={handleAwardAchievement}
      />
    </div>
  );
}
