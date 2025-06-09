import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User } from '@/types/users';
import { getRewardsByTimeFrame } from '@/services/rewardService';

interface LeaderboardTableProps {
  data: User[];
  timeFrame: 'daily' | 'weekly' | 'allTime';
}

// Helper function to validate image URLs
const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;

  // Check if it's a data URL
  if (url.startsWith('data:image/')) return true;

  // Simple check for http/https URLs
  return url.startsWith('http://') || url.startsWith('https://');
};

interface School {
  name: string;
  type: string;
}

// Helper function to get a placeholder school
const getPlaceholderSchool = (index: number): School => {
  const schools: School[] = [
    { name: 'SMK Batu Unjur, Klang', type: 'SMK' },
    { name: 'MRSM Tawau', type: 'MRSM' },
    { name: 'SMKA Sheikh Haji Mohd Said, N. Sembilan', type: 'SMKA' },
    { name: 'Kolej Vokasional Shah Alam', type: 'SMT' },
    { name: 'SBP Integrasi Gombak', type: 'SBP' },
    { name: 'Sekolah Seni Malaysia Kuching', type: 'Sekolah Seni' },
    { name: 'SMJK Chung Ling, Penang', type: 'SMJK' },
    { name: 'Sekolah Sukan Bukit Jalil', type: 'Sekolah Sukan' },
    { name: 'SMK Sultan Abdul Samad, Petaling Jaya', type: 'SMK' },
    { name: 'MRSM Pengkalan Chepa', type: 'MRSM' },
    { name: 'Sekolah Menengah Sains Tuanku Jaafar', type: 'Sekolah Sains' },
    { name: 'SMKA Maahad Hamidiah, Kajang', type: 'SMKA' },
  ];
  return schools[index % schools.length];
};

export default function LeaderboardTable({
  data,
  timeFrame,
}: LeaderboardTableProps) {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isRewardsOpen, setIsRewardsOpen] = useState(false);

  const rewards = getRewardsByTimeFrame(timeFrame);

  const schoolTypes = [
    'all',
    'SMK',
    'SMKA',
    'SBP',
    'MRSM',
    'SMT',
    'Sekolah Seni',
    'Sekolah Sukan',
    'SMJK',
    'Sekolah Sains',
  ];

  const filteredData =
    selectedType === 'all'
      ? data
      : data.filter(
          (_, index) => getPlaceholderSchool(index).type === selectedType
        );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <button
          onClick={() => setIsRewardsOpen(!isRewardsOpen)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <span role="img" aria-label="trophy" className="text-xl">
              🏆
            </span>
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Current Reward Pool
            </h2>
          </div>
          <svg
            className={`w-5 h-5 text-gray-500 transform transition-transform ${
              isRewardsOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isRewardsOpen && (
          <div className="px-6 pb-4 border-t border-gray-200 dark:border-gray-700">
            <div className="py-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="text-yellow-600 dark:text-yellow-400 font-medium">
                    {rewards[0].name}
                  </div>
                  <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                    RM {rewards[0].amount.toFixed(2)}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/20 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="text-gray-600 dark:text-gray-400 font-medium">
                    {rewards[1].name}
                  </div>
                  <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                    RM {rewards[1].amount.toFixed(2)}
                  </div>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="text-amber-600 dark:text-amber-400 font-medium">
                    {rewards[2].name}
                  </div>
                  <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                    RM {rewards[2].amount.toFixed(2)}
                  </div>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-blue-600 dark:text-blue-400 font-medium">
                    {rewards[3].name}
                  </div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    RM {rewards[3].amount.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {timeFrame === 'daily'
                    ? 'Daily rewards reset at midnight MYT'
                    : timeFrame === 'weekly'
                      ? 'Weekly rewards reset every Sunday at midnight MYT'
                      : 'All-time rewards are updated monthly'}
                </div>
                <Link
                  href="/rewards"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:hover:bg-blue-500 transition-colors"
                >
                  <svg
                    className="mr-2 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
                    />
                  </svg>
                  Claim Reward
                </Link>
              </div>

              <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                Top 3 performers and most active participants are eligible for
                rewards
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="mb-4 overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            {schoolTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                  selectedType === type
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {type === 'all' ? 'All Schools' : type}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  School
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredData.map((user, index) => (
                <tr
                  key={user.id}
                  className={`${
                    index < 3
                      ? 'bg-blue-50/50 dark:bg-blue-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  } transition-colors duration-150`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {index < 3 ? (
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 transition-transform hover:scale-110 ${
                            index === 0
                              ? 'bg-yellow-400 dark:bg-yellow-500'
                              : index === 1
                                ? 'bg-gray-300 dark:bg-gray-400'
                                : 'bg-amber-600 dark:bg-amber-700'
                          }`}
                        >
                          <span className="text-white font-bold">
                            {index + 1}
                          </span>
                        </div>
                      ) : (
                        <span className="w-8 text-center mr-2 text-gray-600 dark:text-gray-400">
                          {index + 1}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3 overflow-hidden">
                        {user.avatar_url && isValidImageUrl(user.avatar_url) ? (
                          <Image
                            src={user.avatar_url}
                            alt={`${user.display_name || 'User'}'s avatar`}
                            width={40}
                            height={40}
                            className="object-cover"
                            priority={index < 5}
                            unoptimized={user.avatar_url.startsWith('data:')}
                            onError={() => {
                              console.log(
                                `Failed to load avatar for user: ${user.id}`
                              );
                            }}
                          />
                        ) : (
                          <span className="text-lg font-bold text-blue-500 dark:text-blue-400">
                            {user.display_name?.[0]?.toUpperCase() ||
                              user.email[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <Link
                          href={`/profile?userId=${user.id}`}
                          className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {user.display_name || user.email.split('@')[0]}
                        </Link>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {getPlaceholderSchool(index).name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {getPlaceholderSchool(index).type}
                      </p>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredData.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-10 text-center text-gray-500 dark:text-gray-400"
                  >
                    {selectedType === 'all'
                      ? 'No leaderboard data available'
                      : `No students found from ${selectedType} schools`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
