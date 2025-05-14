import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Subject } from '@/types/topics';

interface LeaderboardFiltersProps {
  timeFrame: 'daily' | 'weekly' | 'allTime';
  onTimeFrameChange: (value: 'daily' | 'weekly' | 'allTime') => void;
  subjectFilter: string | null;
  onSubjectFilterChange: (subjectId: string | null) => void;
}

export default function LeaderboardFilters({
  timeFrame,
  onTimeFrameChange,
  subjectFilter,
  onSubjectFilterChange,
}: LeaderboardFiltersProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  useEffect(() => {
    async function fetchSubjects() {
      try {
        const { data, error } = await supabase
          .from('subjects')
          .select('id, name, slug')
          .order('name');

        if (error) {
          console.error('Error fetching subjects:', error);
          return;
        }

        if (data) {
          // Convert to Subject type
          setSubjects(data as Subject[]);
        }
      } catch (err) {
        console.error('Failed to fetch subjects:', err);
      }
    }

    fetchSubjects();
  }, []);

  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
      {' '}
      <div className="flex items-center space-x-2 md:space-x-4">
        <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
          Time:
        </span>
        <div className="inline-flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => onTimeFrameChange('daily')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              timeFrame === 'daily'
                ? 'bg-white shadow-sm text-blue-600 font-medium'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => onTimeFrameChange('weekly')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              timeFrame === 'weekly'
                ? 'bg-white shadow-sm text-blue-600 font-medium'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => onTimeFrameChange('allTime')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              timeFrame === 'allTime'
                ? 'bg-white shadow-sm text-blue-600 font-medium'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Time
          </button>
        </div>
      </div>{' '}
      <div className="flex items-center space-x-2 md:space-x-4">
        <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
          Subject:
        </span>
        <select
          value={subjectFilter || ''}
          onChange={(e) => onSubjectFilterChange(e.target.value || null)}
          className="border dark:border-gray-600 rounded-md px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Subjects</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
