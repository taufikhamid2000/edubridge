import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

interface StatsCard {
  title: string;
  value: number | string;
  change: number;
  icon: React.ReactNode;
}

export default function AdminDashboard() {
  const [usersCount, setUsersCount] = useState<number>(0);
  const [quizzesCount, setQuizzesCount] = useState<number>(0);
  const [subjectsCount, setSubjectsCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchAdminStats() {
      setLoading(true);
      try {
        // Fetch user count
        const { count: userCount, error: userError } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true });

        if (userError) throw userError;
        setUsersCount(userCount || 0);

        // For quizzes count (assuming you have a quizzes table)
        const { count: quizCount, error: quizError } = await supabase
          .from('quizzes')
          .select('*', { count: 'exact', head: true });

        if (quizError) throw quizError;
        setQuizzesCount(quizCount || 0);

        // For subjects count (assuming you have a subjects table)
        const { count: subjectCount, error: subjectError } = await supabase
          .from('subjects')
          .select('*', { count: 'exact', head: true });

        if (subjectError) throw subjectError;
        setSubjectsCount(subjectCount || 0);
      } catch (error) {
        logger.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAdminStats();
  }, []);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={loading ? '...' : usersCount}
          change={5.25}
          icon={
            <div className="rounded-full bg-blue-100 p-3">
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          }
        />
        <StatCard
          title="Total Quizzes"
          value={loading ? '...' : quizzesCount}
          change={2.5}
          icon={
            <div className="rounded-full bg-green-100 p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          }
        />
        <StatCard
          title="Subjects"
          value={loading ? '...' : subjectsCount}
          change={0}
          icon={
            <div className="rounded-full bg-purple-100 p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-purple-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
          }
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <p>
              No recent activities to display. This feature will be implemented
              soon.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Top Performing Students
          </h2>
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          ) : (
            <div className="space-y-2">
              <p>Leaderboard data will be displayed here.</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Popular Quizzes</h2>
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          ) : (
            <div className="space-y-2">
              <p>Quiz analytics will be displayed here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon }: StatsCard) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <div className="flex items-center mt-2">
            <span
              className={`text-xs font-medium ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}
            >
              {change >= 0 ? '+' : ''}
              {change}%
            </span>
            <span className="text-xs text-gray-500 ml-1">from last month</span>
          </div>
        </div>
        {icon}
      </div>
    </div>
  );
}
