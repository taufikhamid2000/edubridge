import React, { useState } from 'react';
import { School, SchoolType } from '@/types/leaderboard';

interface SchoolLeaderboardTableProps {
  data: School[];
}

export default function SchoolLeaderboardTable({
  data,
}: SchoolLeaderboardTableProps) {
  const [selectedType, setSelectedType] = useState<SchoolType | 'all'>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

  // Get unique states from data
  const states = ['all', ...new Set(data.map((school) => school.state))];

  // School types from the SchoolType enum
  const schoolTypes: Array<SchoolType | 'all'> = [
    'all',
    'SMK',
    'SMKA',
    'MRSM',
    'Sekolah Sains',
    'Sekolah Sukan',
    'Sekolah Seni',
    'SBP',
    'SMJK',
    'KV',
  ];

  // Filter data based on selections
  const filteredData = data.filter((school) => {
    if (selectedType !== 'all' && school.type !== selectedType) return false;
    if (selectedState !== 'all' && school.state !== selectedState) return false;
    if (selectedDistrict !== 'all' && school.district !== selectedDistrict)
      return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Schools
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {data.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Average Score
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {' '}
            {data.length > 0
              ? (
                  data.reduce((acc, school) => acc + school.averageScore, 0) /
                  data.length
                ).toFixed(1)
              : 'N/A'}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Participation Rate
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {' '}
            {data.length > 0
              ? (
                  data.reduce(
                    (acc, school) => acc + school.participationRate,
                    0
                  ) / data.length
                ).toFixed(1)
              : 'N/A'}
            {data.length > 0 ? '%' : ''}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Filters
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400">
              School Type
            </label>
            <select
              value={selectedType}
              onChange={(e) =>
                setSelectedType(e.target.value as SchoolType | 'all')
              }
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm"
            >
              {schoolTypes.map((type) => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400">
              State
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm"
            >
              {states.map((state) => (
                <option key={state} value={state}>
                  {state === 'all' ? 'All States' : state}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400">
              District
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm"
              disabled={selectedState === 'all'}
            >
              <option value="all">All Districts</option>
              {selectedState !== 'all' &&
                Array.from(
                  new Set(
                    data
                      .filter((school) => school.state === selectedState)
                      .map((school) => school.district)
                  )
                ).map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                School
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Average Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Participation
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {filteredData.map((school, index) => {
              const rowClass =
                index < 3
                  ? 'bg-blue-50/50 dark:bg-blue-900/20'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50';
              return (
                <tr
                  key={school.id}
                  className={`${rowClass} transition-colors duration-150`}
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
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {school.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {school.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {school.district}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {school.state}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        school.averageScore >= 90
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : school.averageScore >= 80
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            : school.averageScore >= 70
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {school.averageScore.toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-grow">
                        <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`absolute h-full rounded-full ${
                              school.participationRate >= 90
                                ? 'bg-green-500'
                                : school.participationRate >= 75
                                  ? 'bg-blue-500'
                                  : school.participationRate >= 60
                                    ? 'bg-yellow-500'
                                    : 'bg-gray-500'
                            }`}
                            style={{ width: `${school.participationRate}%` }}
                          />
                        </div>
                      </div>
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        {school.participationRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
