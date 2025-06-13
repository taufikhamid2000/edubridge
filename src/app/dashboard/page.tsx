'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import {
  fetchDashboardData,
  fetchUserStats,
} from '@/services/dashboardService';
import DashboardClient from './DashboardClient';
import LoadingState from '@/components/LoadingState';

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          logger.error('Session error in dashboard:', sessionError);
          router.push('/auth');
          return;
        }

        if (!session) {
          logger.info('No active session, redirecting to auth');
          router.push('/auth');
          return;
        }

        // Session confirmed, enable data fetching
        setIsAuthenticated(true);
      } catch (error) {
        logger.error('Authentication check failed:', error);
        router.push('/auth');
      }
    };

    checkAuth();
  }, [router]);

  // Fetch dashboard data with React Query - only when authenticated
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError,
  } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    enabled: isAuthenticated === true, // Only run when authenticated
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes cache
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // Fetch user stats with React Query - only when authenticated
  const {
    data: userStats,
    isLoading: isStatsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ['userStats'],
    queryFn: fetchUserStats,
    enabled: isAuthenticated === true, // Only run when authenticated
    staleTime: 600000, // 10 minutes
    gcTime: 1200000, // 20 minutes cache
    retry: 1,
    refetchOnWindowFocus: false,
  });
  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return <LoadingState />;
  }

  // Loading state - show loading when queries are running
  if (isDashboardLoading) {
    return <LoadingState />;
  }

  // Error state
  if (dashboardError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">
            {dashboardError instanceof Error
              ? dashboardError.message
              : 'Failed to load dashboard data'}
          </p>
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

  // Data not available state
  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Data Unavailable
          </h1>
          <p className="text-gray-600 mb-4">
            Dashboard data could not be loaded. Please try again.
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
      initialUser={dashboardData.user}
      initialSubjects={dashboardData.subjects}
      initialCategories={dashboardData.categories}
      userStats={userStats}
      statsLoading={isStatsLoading}
      statsError={statsError}
    />
  );
}
