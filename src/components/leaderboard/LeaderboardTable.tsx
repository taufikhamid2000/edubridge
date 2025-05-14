import React from 'react';
import Image from 'next/image';
import { User } from '@/types/users';

interface LeaderboardTableProps {
  data: User[];
}

// Helper function to validate image URLs
const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;

  // Check if it's a data URL
  if (url.startsWith('data:image/')) return true;

  // Simple check for http/https URLs
  return url.startsWith('http://') || url.startsWith('https://');
};

export default function LeaderboardTable({ data }: LeaderboardTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-200">
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
              RANK
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
              STUDENT
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
              LEVEL
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
              XP
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
              STREAK
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((user, index) => (
            <tr
              key={user.id}
              className={`border-b border-gray-200 ${index < 3 ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
            >
              <td className="py-3 px-4 text-gray-800 font-medium">
                <div className="flex items-center">
                  {index < 3 ? (
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                        index === 0
                          ? 'bg-yellow-400'
                          : index === 1
                            ? 'bg-gray-300'
                            : 'bg-amber-600'
                      }`}
                    >
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                  ) : (
                    <span className="w-8 text-center mr-2">{index + 1}</span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-sm">
                <div className="flex items-center">
                  {' '}
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 overflow-hidden">
                    {user.avatar_url && isValidImageUrl(user.avatar_url) ? (
                      <Image
                        src={user.avatar_url}
                        alt={`${user.display_name || 'User'}'s avatar`}
                        width={40}
                        height={40}
                        className="object-cover"
                        priority={index < 5} // Prioritize loading for top users
                        unoptimized={user.avatar_url.startsWith('data:')} // For data URLs
                        onError={() => {
                          // This will be handled by the error boundary
                          console.log(
                            `Failed to load avatar for user: ${user.id}`
                          );
                        }}
                      />
                    ) : (
                      <span className="text-lg font-bold text-blue-500">
                        {user.display_name?.[0]?.toUpperCase() ||
                          user.email[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {user.display_name || user.email.split('@')[0]}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 text-sm">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                  Lvl {user.level}
                </span>
              </td>
              <td className="py-3 px-4 text-sm font-medium text-gray-800">
                {user.xp.toLocaleString()} XP
              </td>
              <td className="py-3 px-4 text-sm">
                <div className="flex items-center">
                  <span className="text-orange-500 mr-1">🔥</span>
                  <span className="font-medium">{user.streak} days</span>
                </div>
              </td>
            </tr>
          ))}

          {data.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-10 text-gray-500">
                No leaderboard data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
