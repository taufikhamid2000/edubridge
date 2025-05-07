import { Quiz } from '@/types/topics';
import { useState, useEffect, useMemo } from 'react';

export interface QuizTableProps {
  quizzes: Quiz[];
}

type SortDirection = 'asc' | 'desc' | null;
type StatusFilter = 'all' | 'verified' | 'unverified';

const ITEMS_PER_PAGE = 5;

export default function QuizTable({ quizzes: initialQuizzes }: QuizTableProps) {
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = () => {
    const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    setSortDirection(newDirection);

    const sortedQuizzes = [...quizzes].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return newDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });

    setQuizzes(sortedQuizzes);
  };

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Update quizzes when initialQuizzes changes
  useEffect(() => {
    setQuizzes(initialQuizzes);
    setSortDirection(null);
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentPage(1);
  }, [initialQuizzes]);

  // Filter and search quizzes
  const filteredQuizzes = useMemo(() => {
    return initialQuizzes.filter((quiz) => {
      // Status filter
      if (statusFilter === 'verified' && !quiz.verified) return false;
      if (statusFilter === 'unverified' && quiz.verified) return false;

      // Search filter - check both name and creator
      if (searchTerm) {
        const searchTermLower = searchTerm.toLowerCase();
        const nameMatch = quiz.name.toLowerCase().includes(searchTermLower);
        const creatorMatch =
          quiz.email &&
          quiz.email.split('@')[0].toLowerCase().includes(searchTermLower);
        return nameMatch || creatorMatch;
      }

      return true;
    });
  }, [initialQuizzes, searchTerm, statusFilter]);

  // Sort filtered quizzes
  const sortedQuizzes = useMemo(() => {
    if (!sortDirection) return filteredQuizzes;

    return [...filteredQuizzes].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [filteredQuizzes, sortDirection]);

  // Paginate sorted quizzes
  const paginatedQuizzes = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedQuizzes.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedQuizzes, currentPage]);

  // Calculate total pages
  const totalPages = Math.max(
    1,
    Math.ceil(sortedQuizzes.length / ITEMS_PER_PAGE)
  );

  return (
    <div className="mt-6">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search quiz name or creator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-md w-full max-w-xs bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-300 self-center">
            Status:
          </span>
          <div className="flex rounded-md overflow-hidden border border-gray-300 dark:border-gray-700">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 text-sm ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('verified')}
              className={`px-3 py-1 text-sm ${
                statusFilter === 'verified'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Verified
            </button>
            <button
              onClick={() => setStatusFilter('unverified')}
              className={`px-3 py-1 text-sm ${
                statusFilter === 'unverified'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Unverified
            </button>
          </div>
        </div>
      </div>

      {/* Result count */}
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        {sortedQuizzes.length === 0
          ? 'No quizzes found'
          : `Showing ${sortedQuizzes.length} ${sortedQuizzes.length === 1 ? 'quiz' : 'quizzes'}`}
      </div>

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="table-auto w-full">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left hidden sm:table-cell">
                Created by
              </th>
              <th
                className="px-4 py-2 text-left cursor-pointer select-none group"
                onClick={handleSort}
              >
                <div className="flex items-center">
                  <span className="md:inline">Created at</span>
                  <span className="ml-1">
                    {sortDirection === 'asc'
                      ? '↑'
                      : sortDirection === 'desc'
                        ? '↓'
                        : '⇅'}
                  </span>
                  <span className="ml-1 text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hidden md:inline">
                    {sortDirection
                      ? sortDirection === 'asc'
                        ? 'Oldest first'
                        : 'Newest first'
                      : 'Click to sort'}
                  </span>
                </div>
              </th>
              <th className="px-4 py-2 text-left hidden sm:table-cell">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedQuizzes.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-4 text-gray-500 dark:text-gray-400"
                >
                  {searchTerm || statusFilter !== 'all'
                    ? 'No quizzes match your search criteria'
                    : 'No quizzes available for this topic yet'}
                </td>
              </tr>
            ) : (
              paginatedQuizzes.map((quiz, index) => (
                <tr
                  key={`${quiz.id}-${index}`}
                  className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors"
                >
                  <td className="px-4 py-3">
                    {quiz.name}
                    {/* Show verification badge on mobile when name is shown */}
                    <span className="ml-2 inline sm:hidden">
                      {quiz.verified ? (
                        <span
                          className="inline-block w-2 h-2 bg-green-500 rounded-full"
                          title="Verified"
                        ></span>
                      ) : (
                        <span
                          className="inline-block w-2 h-2 bg-yellow-500 rounded-full"
                          title="Unverified"
                        ></span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {quiz.email?.split('@')[0] || 'Unknown'}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(quiz.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        quiz.verified
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                      }`}
                    >
                      {quiz.verified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${
                currentPage === 1
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded ${
                currentPage === totalPages
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
