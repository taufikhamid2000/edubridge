/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { School } from '@/types/leaderboard';
import LeaderboardNav from '@/components/leaderboard/LeaderboardNav';
import SchoolLeaderboardTable from '@/components/leaderboard/SchoolLeaderboardTable';

const STATIC_SCHOOL_LEADERBOARD: School[] = [
  {
    id: '1',
    name: 'SMK Ayer Jernih',
    type: 'SMK',
    district: 'Klang',
    state: 'Selangor',
    totalStudents: 1250,
    averageScore: 85.5,
    participationRate: 78.3,
    rank: 1,
  },
  {
    id: '2',
    name: 'MRSM Tawau',
    type: 'MRSM',
    district: 'Tawau',
    state: 'Sabah',
    totalStudents: 950,
    averageScore: 84.2,
    participationRate: 82.1,
    rank: 2,
  },
  {
    id: '3',
    name: 'SMKA Sultan Muhammad',
    type: 'SMKA',
    district: 'Kota Bharu',
    state: 'Kelantan',
    totalStudents: 1100,
    averageScore: 83.8,
    participationRate: 75.5,
    rank: 3,
  },
  {
    id: '4',
    name: 'Sekolah Sains Machang',
    type: 'Sekolah Sains',
    district: 'Machang',
    state: 'Kelantan',
    totalStudents: 800,
    averageScore: 82.9,
    participationRate: 89.2,
    rank: 4,
  },
  {
    id: '5',
    name: 'SMJK Chung Ling',
    type: 'SMJK',
    district: 'Georgetown',
    state: 'Pulau Pinang',
    totalStudents: 1500,
    averageScore: 81.5,
    participationRate: 71.8,
    rank: 5,
  },
];

const STATIC_SCHOOL_STATS = {
  totalSchools: 2547,
  averageParticipation: 73.5,
  totalStudents: 2850000,
  growthRates: {
    schools: 12.5,
    participation: 8.3,
    students: 15.2,
  },
};

export default function StaticSchoolLeaderboardPage() {
  const lastUpdated = new Date();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <LeaderboardNav activeTab="schools" isStatic={true} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          🏫 School Rankings
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Compare and track performance across different schools, districts, and
          states
        </p>
      </div>

      <>
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Active Schools
            </h3>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
              {STATIC_SCHOOL_STATS.totalSchools.toLocaleString()}
            </p>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-500 mr-2">
                ↑ {STATIC_SCHOOL_STATS.growthRates.schools}%
              </span>
              <span className="text-gray-500">from last month</span>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Average Participation
            </h3>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
              {STATIC_SCHOOL_STATS.averageParticipation.toFixed(1)}%
            </p>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-500 mr-2">
                ↑ {STATIC_SCHOOL_STATS.growthRates.participation}%
              </span>
              <span className="text-gray-500">from last month</span>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Student Users
            </h3>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
              {STATIC_SCHOOL_STATS.totalStudents.toLocaleString()}
            </p>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-500 mr-2">
                ↑ {STATIC_SCHOOL_STATS.growthRates.students}%
              </span>
              <span className="text-gray-500">from last month</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <SchoolLeaderboardTable data={STATIC_SCHOOL_LEADERBOARD} />
        </div>

        {/* Bottom Info */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Showing demo data • This is a static preview of the school rankings
        </div>
      </>
    </div>
  );
}
