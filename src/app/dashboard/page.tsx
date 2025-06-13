'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { User } from '@/types/users';
import DashboardClient from './DashboardClient';
import LoadingState from '@/components/LoadingState';

interface Subject {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  category?: string;
  category_priority?: number;
  order_index?: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [dashboardUser, setDashboardUser] = useState<{
    email: string;
    display_name?: string;
    streak: number;
    xp: number;
    level: number;
    lastQuizDate: string;
  } | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        setLoading(true);

        // Get user session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          logger.error('Session error in dashboard:', sessionError);
          setError('Authentication error. Please try signing in again.');
          return;
        }

        if (!session) {
          logger.info('No active session, redirecting to auth');
          router.push('/auth');
          return;
        } // Fetch data in parallel for better performance
        const [
          { data: subjectsData, error: subjectsError },
          { data: userData, error: userError },
        ] = await Promise.all([
          // Fetch subjects
          supabase
            .from('subjects')
            .select('*')
            .order('order_index', { ascending: true }),

          // Fetch user profile
          supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single(),
        ]);

        // Handle fetch errors
        if (subjectsError) {
          logger.error('Error fetching subjects:', subjectsError);
          setError('Failed to load subjects. Please try again.');
          return;
        }

        // PGRST116 is "no rows returned" - expected for new users
        if (userError && userError.code !== 'PGRST116') {
          logger.error('Error fetching user profile:', userError);
          setError('Failed to load user profile. Please try again.');
          return;
        }

        // Create a sorted copy of the subjects data
        const sortedSubjects = [...(subjectsData || [])].sort((a, b) => {
          const priorityA = a.category_priority ?? 999;
          const priorityB = b.category_priority ?? 999;
          return priorityA - priorityB;
        }); // Extract unique categories
        const categoriesData = [
          'all',
          ...new Set(sortedSubjects.map((s) => s.category || 'Uncategorized')),
        ]; // Construct user data for client, ensuring we handle null values
        const dashboardUser = {
          email: session.user.email || '',
          display_name: userData?.display_name || undefined,
          streak: userData?.streak || 0,
          xp: userData?.xp || 0,
          level: userData?.level || 1,
          lastQuizDate:
            userData?.last_quiz_date || new Date().toISOString().split('T')[0],
        };

        // Also create a User object for state management
        const constructedUser: User = {
          id: session.user.id,
          email: session.user.email || '',
          display_name: userData?.display_name || undefined,
          streak: userData?.streak || 0,
          xp: userData?.xp || 0,
          level: userData?.level || 1,
          lastQuizDate:
            userData?.last_quiz_date || new Date().toISOString().split('T')[0],
        };
        setUser(constructedUser);
        setSubjects(sortedSubjects);
        setCategories(categoriesData);

        // Store dashboard user for client component
        setDashboardUser(dashboardUser);
      } catch (error) {
        logger.error('Error in dashboard page:', error);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [router]);
  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  // Auth required state (shouldn't reach here due to redirect, but just in case)
  if (!user || !dashboardUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-600 mb-4">
            Please sign in to access the dashboard.
          </p>
          <a
            href="/auth"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <DashboardClient
      initialUser={dashboardUser}
      initialSubjects={subjects}
      initialCategories={categories}
    />
  );
}
