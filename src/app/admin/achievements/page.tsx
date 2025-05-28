'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import Image from 'next/image';
import {
  AdminLayout,
  SearchBar,
  FilterSortControls,
  DataTableCardView,
  Pagination,
  Message,
  type Column,
  type CardField,
  type SortDirection,
} from '@/components/admin/ui';

interface AchievementRequirement {
  count?: number;
  subject_id?: string;
  streak_days?: number;
  score_percentage?: number;
  quiz_count?: number;
}

interface Achievement {
  id: string;
  achievement_type: string;
  title: string;
  description: string;
  icon_url: string | null;
  xp_reward: number;
  requirements: Record<string, AchievementRequirement>;
  created_at: string;
}

// Type filter options
type TypeFilterOption = 'all' | 'quiz' | 'streak' | 'subject' | 'score';
type SortOption = 'title' | 'type' | 'xp' | 'created';

export default function AdminAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filtering and sorting state
  const [typeFilter, setTypeFilter] = useState<TypeFilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc'); // Modal state - will be used in future implementation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_showEditModal, setShowEditModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_currentAchievement, setCurrentAchievement] =
    useState<Achievement | null>(null);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    fetchAchievements();
  }, []);

  async function fetchAchievements() {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setAchievements(data || []);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error('Error fetching achievements:', error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function handleEditAchievement(achievement: Achievement) {
    setCurrentAchievement(achievement);
    setShowEditModal(true);
  }

  function handleDeleteAchievement(id: string) {
    // This would be implemented to delete an achievement
    console.log('Delete achievement', id);
  }

  // Filter achievements based on search term and type filter
  const filteredAchievements = achievements.filter((achievement) => {
    // Apply search filter
    const matchesSearch =
      achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      achievement.description.toLowerCase().includes(searchTerm.toLowerCase());

    // Apply type filter
    const matchesType =
      typeFilter === 'all' ||
      (typeFilter === 'quiz' &&
        achievement.achievement_type.includes('quiz')) ||
      (typeFilter === 'streak' &&
        achievement.achievement_type.includes('streak')) ||
      (typeFilter === 'subject' &&
        achievement.achievement_type.includes('subject')) ||
      (typeFilter === 'score' &&
        achievement.achievement_type.includes('score'));

    return matchesSearch && matchesType;
  });

  // Sort the filtered achievements
  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    let compareA: string | number = '';
    let compareB: string | number = '';

    switch (sortBy) {
      case 'title':
        compareA = a.title;
        compareB = b.title;
        break;
      case 'type':
        compareA = a.achievement_type;
        compareB = b.achievement_type;
        break;
      case 'xp':
        compareA = a.xp_reward;
        compareB = b.xp_reward;
        break;
      case 'created':
        compareA = new Date(a.created_at).getTime();
        compareB = new Date(b.created_at).getTime();
        break;
    }

    // Compare based on direction
    if (typeof compareA === 'string' && typeof compareB === 'string') {
      return sortDirection === 'asc'
        ? compareA.localeCompare(compareB)
        : compareB.localeCompare(compareA);
    } else {
      return sortDirection === 'asc'
        ? Number(compareA) - Number(compareB)
        : Number(compareB) - Number(compareA);
    }
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAchievements = sortedAchievements.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(sortedAchievements.length / itemsPerPage);

  // Define columns for the data table
  const columns: Column<Achievement>[] = [
    {
      key: 'achievement',
      header: 'Achievement',
      render: (achievement) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            {achievement.icon_url ? (
              <Image
                className="h-10 w-10 rounded-full object-cover"
                src={achievement.icon_url}
                alt={achievement.title}
                width={40}
                height={40}
                unoptimized={achievement.icon_url.startsWith('data:')}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
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
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {achievement.title}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {achievement.description}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (achievement) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {achievement.achievement_type}
        </span>
      ),
    },
    {
      key: 'xp',
      header: 'XP Reward',
      render: (achievement) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {achievement.xp_reward} XP
        </div>
      ),
    },
    {
      key: 'requirements',
      header: 'Requirements',
      render: (achievement) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {achievement.requirements ? (
            <div className="max-w-xs truncate">
              {JSON.stringify(achievement.requirements)}
            </div>
          ) : (
            'None'
          )}
        </span>
      ),
    },
  ];

  // Define fields for the mobile card view
  const cardFields: CardField<Achievement>[] = [
    {
      key: 'header',
      label: '',
      isHeader: true,
      render: (achievement) => (
        <div className="flex items-center mb-3">
          <div className="flex-shrink-0 h-12 w-12 mr-3">
            {achievement.icon_url ? (
              <Image
                className="h-12 w-12 rounded-full object-cover"
                src={achievement.icon_url}
                alt={achievement.title}
                width={48}
                height={48}
                unoptimized={achievement.icon_url.startsWith('data:')}
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
            )}
          </div>
          <div>
            <div className="text-base font-medium text-gray-900 dark:text-gray-100">
              {achievement.title}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {achievement.description}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (achievement) => <span>{achievement.achievement_type}</span>,
    },
    {
      key: 'xp',
      label: 'XP Reward',
      render: (achievement) => <span>{achievement.xp_reward} XP</span>,
    },
    {
      key: 'requirements',
      label: 'Requirements',
      isFooter: true,
      render: (achievement) =>
        achievement.requirements ? (
          <div className="truncate max-w-full">
            {JSON.stringify(achievement.requirements)}
          </div>
        ) : (
          'None'
        ),
    },
  ];

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  // Handle sort change
  const handleSortChange = (option: string) => {
    if (sortBy === (option as SortOption)) {
      toggleSortDirection();
    } else {
      setSortBy(option as SortOption);
      setSortDirection('asc');
    }
  };

  // Filter options
  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'quiz', label: 'Quiz' },
    { id: 'streak', label: 'Streak' },
    { id: 'subject', label: 'Subject' },
    { id: 'score', label: 'Score' },
  ];

  // Sort options
  const sortOptions = [
    { id: 'title', label: 'Title' },
    { id: 'type', label: 'Type' },
    { id: 'xp', label: 'XP Reward' },
    { id: 'created', label: 'Created Date' },
  ];

  return (
    <AdminLayout
      title="Achievement Management"
      refreshAction={fetchAchievements}
      isLoading={loading}
    >
      <div className="space-y-4">
        {/* Success/Error Messages */}
        {error && (
          <Message
            type="error"
            message={error}
            onDismiss={() => setError(null)}
            onRetry={fetchAchievements}
          />
        )}

        {successMessage && (
          <Message
            type="success"
            message={successMessage}
            onDismiss={() => setSuccessMessage(null)}
          />
        )}

        {/* Header with Create Button */}
        <div className="flex justify-between items-center">
          <div className="hidden md:block">
            {/* SearchBar is shown in the mobile dropdown */}
          </div>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
            onClick={() => console.log('Create new achievement')}
          >
            Create New Achievement
          </button>
        </div>

        {/* Search Bar + Filter Controls */}
        <div className="mb-4">
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            placeholder="Search achievements..."
            className="mb-4"
          />

          <FilterSortControls
            selectedFilter={typeFilter}
            onFilterChange={(filter) =>
              setTypeFilter(filter as TypeFilterOption)
            }
            filterOptions={filterOptions}
            selectedSort={sortBy}
            onSortChange={handleSortChange}
            sortOptions={sortOptions}
            sortDirection={sortDirection}
            onSortDirectionChange={toggleSortDirection}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            perPageOptions={[5, 10, 25, 50]}
          />
        </div>

        {/* Data Table and Card View */}
        <DataTableCardView
          data={currentAchievements}
          isLoading={loading}
          columns={columns}
          cardFields={cardFields}
          keyExtractor={(item) => item.id}
          emptyMessage="No achievements found. Create your first achievement to get started."
          emptyFilteredMessage="No achievements match your search criteria."
          isFiltered={searchTerm !== '' || typeFilter !== 'all'}
          actions={(achievement) => (
            <>
              <button
                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                onClick={() => handleEditAchievement(achievement)}
              >
                Edit
              </button>
              <button
                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                onClick={() => handleDeleteAchievement(achievement.id)}
              >
                Delete
              </button>
            </>
          )}
        />

        {/* Pagination */}
        {sortedAchievements.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={sortedAchievements.length}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Achievement Examples Section */}
        {achievements.length === 0 && !loading && (
          <div className="mt-8 bg-blue-50 border border-blue-200 p-6 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
            <h2 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">
              Achievement Examples
            </h2>
            <p className="text-blue-700 dark:text-blue-400 mb-4">
              Here are some example achievements you might want to create:
            </p>
            <ul className="list-disc list-inside space-y-2 text-blue-700 dark:text-blue-400">
              <li>
                First Quiz Completed - Awarded when a user completes their first
                quiz
              </li>
              <li>Perfect Score - Awarded when a user gets 100% on a quiz</li>
              <li>
                Study Streak - Awarded for completing quizzes 5 days in a row
              </li>
              <li>
                Subject Master - Awarded for completing all quizzes in a subject
              </li>
              <li>Quiz Creator - Awarded for creating their first quiz</li>
            </ul>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
