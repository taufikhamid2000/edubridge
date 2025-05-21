/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { logger } from '@/lib/logger';
import Link from 'next/link';
import {
  Quiz,
  Topic,
  fetchAdminQuizzes,
  createAdminQuiz as createQuiz,
  deleteQuiz,
} from '@/services';
import {
  DataTableCardView,
  type Column,
  type CardField,
  Message,
  SearchBar,
  FilterSortControls,
  type SortDirection,
  Pagination,
} from '@/components/admin/ui';

interface QuizManagementProps {
  topics?: Topic[];
  loading?: boolean;
  setLoading?: (loading: boolean) => void;
  setError?: (error: string | null) => void;
  setSuccessMessage?: (message: string | null) => void;
}

export default function QuizManagement({
  topics = [],
  loading: parentLoading = false,
  setLoading: setParentLoading = () => {},
  setError: setParentError = () => {},
  setSuccessMessage: setParentSuccessMessage = () => {},
}: QuizManagementProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showNewQuizForm, setShowNewQuizForm] = useState(false);
  const [newQuiz, setNewQuiz] = useState({
    name: '',
    topic_id: '',
    difficulty_level: 'medium',
    time_limit_seconds: 300,
    passing_score: 70,
  });

  // Pagination, filtering and sorting state
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Function to fetch quizzes
  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setParentLoading(true);
      setError(null);
      setParentError(null);

      console.log('Attempting to fetch quizzes via client-side service...');

      const { data, error } = await fetchAdminQuizzes();

      if (error) {
        console.error('Quiz fetch error:', error);
        setError(`Failed to fetch quizzes: ${error.message}`);
        setParentError(`Failed to fetch quizzes: ${error.message}`);
        return;
      }

      if (!data) {
        setError('No quizzes data returned');
        setParentError('No quizzes data returned');
        return;
      }

      setQuizzes(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error('Error fetching quizzes:', error);
      setError(`Failed to fetch quizzes: ${errorMessage}`);
      setParentError(`Failed to fetch quizzes: ${errorMessage}`);
    } finally {
      setLoading(false);
      setParentLoading(false);
    }
  };

  // Function to handle quiz creation
  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setParentLoading(true);
      setError(null);
      setParentError(null);

      if (!newQuiz.name.trim()) {
        setError('Quiz name is required');
        setParentError('Quiz name is required');
        return;
      }

      if (!newQuiz.topic_id) {
        setError('Please select a topic');
        setParentError('Please select a topic');
        return;
      }

      const { error } = await createQuiz({
        name: newQuiz.name,
        topic_id: newQuiz.topic_id,
        difficulty_level: newQuiz.difficulty_level as
          | 'easy'
          | 'medium'
          | 'hard',
        time_limit_seconds: newQuiz.time_limit_seconds,
        passing_score: newQuiz.passing_score,
      });

      if (error) {
        setError(`Failed to create quiz: ${error.message}`);
        setParentError(`Failed to create quiz: ${error.message}`);
        return;
      }

      const message = 'Quiz created successfully!';
      setSuccessMessage(message);
      setParentSuccessMessage(message);
      setNewQuiz({
        name: '',
        topic_id: '',
        difficulty_level: 'medium',
        time_limit_seconds: 300,
        passing_score: 70,
      });
      setShowNewQuizForm(false);
      await fetchQuizzes();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error('Error creating quiz:', error);
      setError(`Failed to create quiz: ${errorMessage}`);
      setParentError(`Failed to create quiz: ${errorMessage}`);
    } finally {
      setLoading(false);
      setParentLoading(false);
    }
  };

  // Function to handle quiz deletion
  const handleDeleteQuiz = async (quizId: string) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this quiz? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      setParentLoading(true);
      setError(null);
      setParentError(null);

      const { error } = await deleteQuiz(quizId);

      if (error) {
        setError(`Failed to delete quiz: ${error.message}`);
        setParentError(`Failed to delete quiz: ${error.message}`);
        return;
      }

      const message = 'Quiz deleted successfully!';
      setSuccessMessage(message);
      setParentSuccessMessage(message);
      await fetchQuizzes();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error('Error deleting quiz:', error);
      setError(`Failed to delete quiz: ${errorMessage}`);
      setParentError(`Failed to delete quiz: ${errorMessage}`);
    } finally {
      setLoading(false);
      setParentLoading(false);
    }
  };

  // Function to get topic title by ID
  const getTopicTitle = useCallback(
    (topicId: string) => {
      const topic = topics.find((t) => t.id === topicId);
      return topic ? topic.title : 'Unknown Topic';
    },
    [topics]
  );

  // Sort options for the quizzes
  const sortOptions = [
    { id: 'name', label: 'Name' },
    { id: 'topic', label: 'Topic' },
    { id: 'difficulty', label: 'Difficulty' },
    { id: 'questions', label: 'Questions' },
  ];

  // Filter options
  const filterOptions = [{ id: 'all', label: 'All Quizzes' }];

  // Difficulty level options
  const difficultyLevels = [
    { id: 'all', label: 'All Difficulties' },
    { id: 'easy', label: 'Easy' },
    { id: 'medium', label: 'Medium' },
    { id: 'hard', label: 'Hard' },
  ];

  // Toggle sort direction
  const handleSortDirectionToggle = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  // Filter and sort quizzes
  const filteredQuizzes = useMemo(() => {
    // First filter by search term
    let filtered = quizzes.filter((quiz) =>
      quiz.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Then apply the topic filter
    if (topicFilter !== 'all') {
      filtered = filtered.filter((quiz) => quiz.topic_id === topicFilter);
    }

    // Apply difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(
        (quiz) => quiz.difficulty_level === difficultyFilter
      );
    }

    // Sort the filtered results
    return filtered.sort((a, b) => {
      let comparison = 0;
      if (selectedSort === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (selectedSort === 'topic') {
        const topicA = getTopicTitle(a.topic_id);
        const topicB = getTopicTitle(b.topic_id);
        comparison = topicA.localeCompare(topicB);
      } else if (selectedSort === 'difficulty') {
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
        const diffA =
          difficultyOrder[a.difficulty_level as keyof typeof difficultyOrder] ||
          2;
        const diffB =
          difficultyOrder[b.difficulty_level as keyof typeof difficultyOrder] ||
          2;
        comparison = diffA - diffB;
      } else if (selectedSort === 'questions') {
        const countA = a.question_count || 0;
        const countB = b.question_count || 0;
        comparison = countA - countB;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [
    quizzes,
    searchTerm,
    topicFilter,
    difficultyFilter,
    selectedSort,
    sortDirection,
    getTopicTitle,
  ]);

  // Pagination calculation
  const totalItems = filteredQuizzes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedQuizzes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredQuizzes.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredQuizzes, currentPage, itemsPerPage]);

  // Define columns for DataTableCardView
  const columns: Column<Quiz>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (quiz) => (
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {quiz.name}
        </div>
      ),
    },
    {
      key: 'topic',
      header: 'Topic',
      render: (quiz) => (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {getTopicTitle(quiz.topic_id)}
        </div>
      ),
    },
    {
      key: 'difficulty',
      header: 'Difficulty',
      render: (quiz) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            quiz.difficulty_level === 'easy'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : quiz.difficulty_level === 'medium'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {quiz.difficulty_level || 'Medium'}
        </span>
      ),
    },
    {
      key: 'questions',
      header: 'Questions',
      render: (quiz) => (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {quiz.question_count || 0}
        </div>
      ),
    },
  ];

  // Define card fields for mobile view
  const cardFields: CardField<Quiz>[] = [
    {
      key: 'name',
      label: 'Name',
      isHeader: true,
      render: (quiz) => (
        <div className="text-base font-medium text-gray-900 dark:text-gray-100">
          {quiz.name}
        </div>
      ),
    },
    {
      key: 'topic',
      label: 'Topic',
      render: (quiz) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {getTopicTitle(quiz.topic_id)}
        </div>
      ),
    },
    {
      key: 'difficulty',
      label: 'Difficulty',
      render: (quiz) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            quiz.difficulty_level === 'easy'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : quiz.difficulty_level === 'medium'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {quiz.difficulty_level || 'Medium'}
        </span>
      ),
    },
    {
      key: 'questions',
      label: 'Questions',
      render: (quiz) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {quiz.question_count || 0}
        </div>
      ),
    },
  ];

  // Actions render function
  const renderActions = (quiz: Quiz) => (
    <>
      <Link
        href={`/admin/quizzes/${quiz.id}/questions`}
        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
      >
        Edit Questions
      </Link>
      <button
        onClick={() => handleDeleteQuiz(quiz.id)}
        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
      >
        Delete
      </button>
    </>
  );

  // Fetch quizzes on component mount
  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const isLoading = loading || parentLoading;
  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold dark:text-white">
          Quiz Management
        </h2>
        <button
          onClick={() => setShowNewQuizForm(!showNewQuizForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          {showNewQuizForm ? 'Cancel' : 'Add New Quiz'}
        </button>
      </div>

      {error && !parentLoading && (
        <Message
          type="error"
          message={error}
          onDismiss={() => setError(null)}
          onRetry={fetchQuizzes}
        />
      )}

      {successMessage && !parentLoading && (
        <Message
          type="success"
          message={successMessage}
          onDismiss={() => setSuccessMessage(null)}
        />
      )}

      {showNewQuizForm && (
        <form
          onSubmit={handleCreateQuiz}
          className="mb-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
        >
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Quiz Name
            </label>
            <input
              type="text"
              id="name"
              value={newQuiz.name}
              onChange={(e) => setNewQuiz({ ...newQuiz, name: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="topic"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Topic
            </label>
            <select
              id="topic"
              value={newQuiz.topic_id}
              onChange={(e) =>
                setNewQuiz({ ...newQuiz, topic_id: e.target.value })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              required
            >
              <option value="">Select a Topic</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="difficulty"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Difficulty Level
            </label>
            <select
              id="difficulty"
              value={newQuiz.difficulty_level}
              onChange={(e) =>
                setNewQuiz({ ...newQuiz, difficulty_level: e.target.value })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="time-limit"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Time Limit (seconds)
            </label>
            <input
              type="number"
              id="time-limit"
              value={newQuiz.time_limit_seconds}
              onChange={(e) =>
                setNewQuiz({
                  ...newQuiz,
                  time_limit_seconds: parseInt(e.target.value),
                })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              min="60"
              max="3600"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="passing-score"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Passing Score (%)
            </label>
            <input
              type="number"
              id="passing-score"
              value={newQuiz.passing_score}
              onChange={(e) =>
                setNewQuiz({
                  ...newQuiz,
                  passing_score: parseInt(e.target.value),
                })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              min="1"
              max="100"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Quiz'}
            </button>
          </div>
        </form>
      )}

      {/* Search and Filter Controls */}
      <div className="mb-4 space-y-4">
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder="Search quizzes..."
          className="w-full md:w-64"
        />

        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filter by Topic
            </label>
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Topics</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filter by Difficulty
            </label>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              {difficultyLevels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          <FilterSortControls
            sortOptions={sortOptions}
            selectedSort={selectedSort}
            onSortChange={setSelectedSort}
            sortDirection={sortDirection}
            onSortDirectionChange={handleSortDirectionToggle}
            filterOptions={filterOptions}
            selectedFilter="all"
            onFilterChange={() => {}}
          />
        </div>
      </div>

      {/* Quiz Data Table */}
      <DataTableCardView<Quiz>
        data={paginatedQuizzes}
        isLoading={isLoading}
        columns={columns}
        cardFields={cardFields}
        keyExtractor={(quiz) => quiz.id}
        emptyMessage="No quizzes found. Create your first quiz to get started."
        actions={renderActions}
      />

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}
    </div>
  );
}
