// src/__tests__/components/dashboard/DashboardPage.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardPage from '@/app/dashboard/page';
import { supabase } from '@/lib/supabase';
import * as dashboardService from '@/services/dashboardService';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
  },
}));

jest.mock('@/services/dashboardService', () => ({
  fetchDashboardData: jest.fn(),
  fetchUserStats: jest.fn(),
}));

jest.mock('@/components/LoadingState', () => {
  return function LoadingState() {
    return <div data-testid="loading-state">Loading...</div>;
  };
});

jest.mock('@/app/dashboard/DashboardClient', () => {
  return function DashboardClient(props: any) {
    return (
      <div data-testid="dashboard-client">
        <div data-testid="user-email">{props.initialUser?.email}</div>
        <div data-testid="subjects-count">{props.initialSubjects?.length}</div>
        <div data-testid="user-stats">
          {props.userStats ? 'Stats loaded' : 'No stats'}
        </div>
      </div>
    );
  };
});

const mockPush = jest.fn();
const mockSupabase = {
  auth: {
    getSession: jest.fn(),
  },
};
// Override the mocked supabase
(supabase as any).auth.getSession = mockSupabase.auth.getSession;
const mockFetchDashboardData =
  dashboardService.fetchDashboardData as jest.MockedFunction<
    typeof dashboardService.fetchDashboardData
  >;
const mockFetchUserStats =
  dashboardService.fetchUserStats as jest.MockedFunction<
    typeof dashboardService.fetchUserStats
  >;

// Test wrapper with QueryClient
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  describe('Authentication Flow', () => {
    it('should show loading state initially', async () => {
      mockSupabase.auth.getSession.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    });

    it('should redirect to auth when no session exists', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth');
      });
    });

    it('should redirect to auth when session error occurs', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Session error' },
      });

      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth');
      });
    });

    it('should not redirect when valid session exists', async () => {
      const mockSession = {
        user: { id: 'test-user', email: 'test@example.com' },
        access_token: 'mock-token',
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      mockFetchDashboardData.mockResolvedValue({
        user: {
          email: 'test@example.com',
          display_name: 'Test User',
          streak: 5,
          xp: 1000,
          level: 3,
          lastQuizDate: '2025-06-14',
        },
        subjects: [],
        categories: [],
        stats: {
          totalSubjects: 0,
          completedQuizzes: 0,
        },
      });

      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockPush).not.toHaveBeenCalled();
      });
    });
  });

  describe('Data Fetching', () => {
    const mockSession = {
      user: { id: 'test-user', email: 'test@example.com' },
      access_token: 'mock-token',
    };
    const mockDashboardData = {
      user: {
        email: 'test@example.com',
        display_name: 'Test User',
        streak: 5,
        xp: 1000,
        level: 3,
        lastQuizDate: '2025-06-14',
      },
      subjects: [
        {
          id: '1',
          name: 'Mathematics',
          slug: 'mathematics',
          description: 'Math subjects',
          icon: '🔢',
          category: 'STEM',
          category_priority: 1,
          order_index: 1,
        },
      ],
      categories: ['STEM'],
      stats: {
        totalSubjects: 1,
        completedQuizzes: 5,
        userRank: 3,
      },
    };

    const mockUserStats = {
      weeklyProgress: {
        quizzesCompleted: 5,
        quizzesTotal: 10,
        averageScore: 85.5,
      },
      achievements: [
        {
          title: 'First Quiz',
          description: 'Completed your first quiz',
          bgColor: 'bg-green-100',
          earned: true,
          earnedDate: '2025-06-01',
        },
      ],
      streakInfo: {
        currentStreak: 5,
        longestStreak: 10,
        streakType: 'days' as const,
      },
      recentActivity: [
        {
          type: 'quiz_completed' as const,
          title: 'Math Quiz',
          description: 'Completed with 85% score',
          date: '2025-06-14',
          score: 85,
        },
      ],
    };

    beforeEach(() => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
    });

    it('should render dashboard when data loads successfully', async () => {
      mockFetchDashboardData.mockResolvedValue(mockDashboardData);
      mockFetchUserStats.mockResolvedValue(mockUserStats);

      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-client')).toBeInTheDocument();
      });

      expect(screen.getByTestId('user-email')).toHaveTextContent(
        'test@example.com'
      );
      expect(screen.getByTestId('subjects-count')).toHaveTextContent('1');
      expect(screen.getByTestId('user-stats')).toHaveTextContent(
        'Stats loaded'
      );
    });
    it('should show error state when dashboard data fetch fails', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: '1' } } },
        error: null,
      });
      mockFetchDashboardData.mockRejectedValue(new Error('Failed to fetch'));

      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      // Wait for the error state to appear
      await waitFor(
        () => {
          expect(screen.getByText('Error')).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    });
    it('should show retry button on error', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: '1' } } },
        error: null,
      });
      mockFetchDashboardData.mockRejectedValue(new Error('Network error'));

      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      // Wait for the retry button to appear
      await waitFor(
        () => {
          expect(screen.getByText('Retry')).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });
    it('should handle authentication error in data fetching', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: '1' } } },
        error: null,
      });
      mockFetchDashboardData.mockRejectedValue(
        new Error('Authentication required')
      );

      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      // Wait for the authentication error message to appear
      await waitFor(
        () => {
          expect(
            screen.getByText('Authentication required')
          ).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    it('should show data unavailable state when no data returned', async () => {
      mockFetchDashboardData.mockResolvedValue(null as any);

      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Data Unavailable')).toBeInTheDocument();
        expect(screen.getByText('Go to Sign In')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    const mockSession = {
      user: { id: 'test-user', email: 'test@example.com' },
      access_token: 'mock-token',
    };

    it('should show loading during authentication check', async () => {
      mockSupabase.auth.getSession.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  data: { session: mockSession },
                  error: null,
                }),
              100
            )
          )
      );

      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    });

    it('should show loading during data fetch', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      mockFetchDashboardData.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toBeInTheDocument();
      });
    });
  });

  describe('React Query Integration', () => {
    const mockSession = {
      user: { id: 'test-user', email: 'test@example.com' },
      access_token: 'mock-token',
    };

    it('should not fetch data before authentication is confirmed', async () => {
      // Session check is pending
      mockSupabase.auth.getSession.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      // Wait a bit to ensure queries don't execute
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockFetchDashboardData).not.toHaveBeenCalled();
      expect(mockFetchUserStats).not.toHaveBeenCalled();
    });

    it('should fetch data only after authentication is confirmed', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      mockFetchDashboardData.mockResolvedValue({
        user: { email: 'test@example.com' },
        subjects: [],
        categories: [],
        stats: { totalSubjects: 0 },
      } as any);

      mockFetchUserStats.mockResolvedValue({
        weeklyProgress: {
          quizzesCompleted: 0,
          quizzesTotal: 0,
          averageScore: 0,
        },
        achievements: [],
      });

      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockFetchDashboardData).toHaveBeenCalled();
        expect(mockFetchUserStats).toHaveBeenCalled();
      });
    });
  });
});
