'use client';

import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';
import LeaderboardFilters from '@/components/leaderboard/LeaderboardFilters';
import LeaderboardHeader from '@/components/leaderboard/LeaderboardHeader';
import LeaderboardNav from '@/components/leaderboard/LeaderboardNav';
import { User } from '@/types/users';

const STATIC_LEADERBOARD: User[] = [
  {
    id: '1',
    email: 'sarah@example.com',
    display_name: 'Sarah Chen',
    streak: 15,
    xp: 2500,
    level: 8,
    school_id: 'smk1',
    is_school_visible: true,
    school: {
      id: 'smk1',
      name: 'SMK Ayer Jernih',
      type: 'SMK',
      district: 'Klang',
      state: 'Selangor',
    },
    avatar_url: 'data:image/svg+xml;utf8,😊',
    created_at: '2025-05-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'james@example.com',
    display_name: 'James Wilson',
    streak: 12,
    xp: 2350,
    level: 7,
    school_id: 'mrsm1',
    is_school_visible: true,
    school: {
      id: 'mrsm1',
      name: 'MRSM Tawau',
      type: 'MRSM',
      district: 'Tawau',
      state: 'Sabah',
    },
    avatar_url: 'data:image/svg+xml;utf8,🎓',
    created_at: '2025-05-02T00:00:00Z',
  },
  {
    id: '3',
    email: 'maria@example.com',
    display_name: 'Maria Garcia',
    streak: 10,
    xp: 2200,
    level: 7,
    school_id: 'smka1',
    is_school_visible: true,
    school: {
      id: 'smka1',
      name: 'SMKA Sultan Muhammad',
      type: 'SMKA',
      district: 'Kota Bharu',
      state: 'Kelantan',
    },
    avatar_url: 'data:image/svg+xml;utf8,🌟',
    created_at: '2025-05-03T00:00:00Z',
  },
  {
    id: '4',
    email: 'alex@example.com',
    display_name: 'Alex Lin',
    streak: 8,
    xp: 1800,
    level: 6,
    school_id: 'smjk1',
    is_school_visible: true,
    school: {
      id: 'smjk1',
      name: 'SMJK Chung Ling',
      type: 'SMJK',
      district: 'Georgetown',
      state: 'Pulau Pinang',
    },
    avatar_url: 'data:image/svg+xml;utf8,📚',
    created_at: '2025-05-04T00:00:00Z',
  },
  {
    id: '5',
    email: 'amira@example.com',
    display_name: 'Nur Amira',
    streak: 7,
    xp: 1650,
    level: 5,
    school_id: 'sbp1',
    is_school_visible: true,
    school: {
      id: 'sbp1',
      name: 'Sekolah Seri Puteri',
      type: 'SBP',
      district: 'Cyberjaya',
      state: 'Selangor',
    },
    avatar_url: 'data:image/svg+xml;utf8,🎯',
    created_at: '2025-05-05T00:00:00Z',
  },
];

export default function StaticLeaderboardPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <LeaderboardNav activeTab="students" isStatic={true} />
      <LeaderboardHeader currentUserRank={1} />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl">
        <LeaderboardFilters
          timeFrame="allTime"
          onTimeFrameChange={() => {}}
          subjectFilter={null}
          onSubjectFilterChange={() => {}}
        />
        <div className="fade-in animate-fadeIn">
          <LeaderboardTable data={STATIC_LEADERBOARD} timeFrame="allTime" />
          <div className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
            Showing demo data • This is a static preview of the leaderboard
          </div>
        </div>
      </div>
    </div>
  );
}
