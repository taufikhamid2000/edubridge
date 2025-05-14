'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Achievement } from '@/types/users';
import {
  fetchUserProfile,
  fetchUserAchievements,
} from '@/services/profileService';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfileAchievements from '@/components/profile/ProfileAchievements';
import ProfileSettings from '@/components/profile/ProfileSettings';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'stats' | 'achievements' | 'settings'
  >('stats');

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/auth');
      }
    };

    checkAuth();
  }, [router]);
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);

        // Check if user is logged in
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          setError('You need to be logged in to view your profile.');
          setLoading(false);
          return;
        } // Fetch user profile data
        const { data: userData, error: userError } = await fetchUserProfile();

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

        setUser(userData);

        // Fetch user achievements
        const { data: achievementsData, error: achievementsError } =
          await fetchUserAchievements();

        if (achievementsError) {
          logger.error('Achievements fetch error:', achievementsError);
          // We'll continue even if achievements fail to load
        }

        setAchievements(achievementsData || []);
      } catch (err) {
        setError('An unexpected error occurred. Please try again.');
        logger.error('Unexpected error in profile page:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, []);
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
                  activeTab === 'settings'
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('settings')}
              >
                Settings
              </button>
            </nav>
          </div>
          {/* Tab Content */}{' '}
          <div className="p-6">
            {activeTab === 'stats' && <ProfileStats user={user} />}
            {activeTab === 'achievements' && (
              <ProfileAchievements
                achievements={achievements}
                loading={loading}
              />
            )}
            {activeTab === 'settings' && <ProfileSettings user={user} />}
          </div>
        </div>
      </div>
    </div>
  );
}
