'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  fetchDashboardData,
  fetchUserStats,
} from '@/services/dashboardService';
import DashboardClient from './DashboardClient';

export default function DashboardPage() {
  const [isUpgrading, setIsUpgrading] = useState(false);
  // Fetch dashboard data with React Query - no authentication required
  const { data: dashboardData, error: dashboardError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes cache
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // Fetch user stats with React Query - progressive enhancement
  const {
    data: userStats,
    isLoading: isStatsLoading,
    error: statsError,
    isFetched: isStatsFetched,
  } = useQuery({
    queryKey: ['userStats'],
    queryFn: fetchUserStats,
    staleTime: 600000, // 10 minutes
    gcTime: 1200000, // 20 minutes cache
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Show upgrading indicator when real data is being fetched
  useEffect(() => {
    if (isStatsLoading) {
      setIsUpgrading(true);
    } else if (isStatsFetched) {
      setIsUpgrading(false);
    }
  }, [isStatsLoading, isStatsFetched]);

  // Never show loading spinner for dashboard data - show guest data immediately
  // Only show error if critical dashboard data fails
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
  return (
    <div className="relative">
      {/* Upgrading indicator */}
      {isUpgrading && (
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-center text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full shadow-lg">
            <div className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent mr-2"></div>
            Loading your data...
          </div>
        </div>
      )}

      <DashboardClient
        initialUser={dashboardData.user}
        initialSubjects={dashboardData.subjects}
        initialCategories={dashboardData.categories}
        userStats={userStats}
        statsLoading={isStatsLoading}
        statsError={statsError}
      />
    </div>
  );
}
