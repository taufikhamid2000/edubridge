'use client';

import SchoolLeaderboardTable from '@/components/leaderboard/SchoolLeaderboardTable';
import LeaderboardNav from '@/components/leaderboard/LeaderboardNav';

// Placeholder data - would be fetched from your database
const mockSchoolData = [
  {
    id: '1',
    name: 'MRSM Tawau',
    type: 'MRSM',
    district: 'Tawau',
    state: 'Sabah',
    totalStudents: 850,
    averageScore: 92.5,
    participationRate: 95,
    rank: 1,
  },
  {
    id: '2',
    name: 'SMK Batu Unjur',
    type: 'SMK',
    district: 'Klang',
    state: 'Selangor',
    totalStudents: 1200,
    averageScore: 88.7,
    participationRate: 82,
    rank: 2,
  },
  {
    id: '3',
    name: 'SMKA Sheikh Haji Mohd Said',
    type: 'SMKA',
    district: 'Seremban',
    state: 'N. Sembilan',
    totalStudents: 950,
    averageScore: 87.2,
    participationRate: 88,
    rank: 3,
  },
  {
    id: '4',
    name: 'SMK Sultan Abdul Samad',
    type: 'SMK',
    district: 'Petaling',
    state: 'Selangor',
    totalStudents: 1500,
    averageScore: 86.5,
    participationRate: 75,
    rank: 4,
  },
  {
    id: '5',
    name: 'Sekolah Sains Tuanku Jaafar',
    type: 'Sekolah Sains',
    district: 'Kuala Pilah',
    state: 'N. Sembilan',
    totalStudents: 600,
    averageScore: 85.9,
    participationRate: 92,
    rank: 5,
  },
  {
    id: '6',
    name: 'MRSM Pengkalan Chepa',
    type: 'MRSM',
    district: 'Kota Bharu',
    state: 'Kelantan',
    totalStudents: 720,
    averageScore: 85.1,
    participationRate: 89,
    rank: 6,
  },
  {
    id: '7',
    name: 'SMK Damansara Jaya',
    type: 'SMK',
    district: 'Petaling',
    state: 'Selangor',
    totalStudents: 1800,
    averageScore: 84.8,
    participationRate: 71,
    rank: 7,
  },
  {
    id: '8',
    name: 'Kolej Vokasional Shah Alam',
    type: 'KV',
    district: 'Petaling',
    state: 'Selangor',
    totalStudents: 950,
    averageScore: 84.3,
    participationRate: 85,
    rank: 8,
  },
  {
    id: '9',
    name: 'SMJK Chung Ling',
    type: 'SMJK',
    district: 'Timur Laut',
    state: 'Pulau Pinang',
    totalStudents: 2200,
    averageScore: 83.9,
    participationRate: 78,
    rank: 9,
  },
  {
    id: '10',
    name: 'Sekolah Seni Malaysia Kuching',
    type: 'Sekolah Seni',
    district: 'Kuching',
    state: 'Sarawak',
    totalStudents: 480,
    averageScore: 83.5,
    participationRate: 94,
    rank: 10,
  },
];

export default function SchoolLeaderboardPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <LeaderboardNav activeTab="schools" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          🏫 School Rankings
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Compare and track performance across different schools, districts, and
          states
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Active Schools
          </h3>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
            2,145
          </p>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-500 mr-2">↑ 12%</span>
            <span className="text-gray-500">from last month</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Average Participation
          </h3>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
            76.3%
          </p>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-500 mr-2">↑ 5%</span>
            <span className="text-gray-500">from last month</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Student Users
          </h3>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
            45,678
          </p>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-500 mr-2">↑ 8%</span>
            <span className="text-gray-500">from last month</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <SchoolLeaderboardTable data={mockSchoolData} />
      </div>

      {/* Bottom Info */}
      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        Last updated: {new Date().toLocaleString()} • Rankings are updated daily
      </div>
    </div>
  );
}
