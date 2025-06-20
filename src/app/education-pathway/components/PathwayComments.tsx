'use client';

import { FC } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { usePathwayComments } from '../hooks/usePathwayComments';

interface PathwayCommentsProps {
  pathwayId: string;
}

const PathwayComments: FC<PathwayCommentsProps> = ({ pathwayId }) => {
  const {
    comments: currentComments,
    isLoading,
    error,
    sortOrder,
    setSortOrder,
    currentPage,
    setCurrentPage,
    totalPages,
    commentText,
    setCommentText,
    isAnonymous,
    setIsAnonymous,
    handleSubmitComment,
    isAuthenticated,
    authLoading,
    isAdmin,
    handleDeleteComment,
  } = usePathwayComments(pathwayId);
  return (
    <div className="border-t border-gray-700 dark:border-gray-200 px-4 py-5 sm:px-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-white dark:text-gray-900">
          Student Tips & Experiences
        </h3>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400 dark:text-gray-600">
            Sort by:
          </span>
          <div className="relative">
            <select
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(e.target.value as 'newest' | 'oldest')
              }
              className="bg-gray-700 dark:bg-white border border-gray-600 dark:border-gray-300 text-white dark:text-gray-900 rounded-md py-1 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-400 dark:text-gray-600">
              Loading comments...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-400 dark:text-red-600">
              Could not load comments. Please try again later.
            </p>
          </div>
        ) : currentComments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 dark:text-gray-600">
              No comments yet for this education pathway. Be the first to share
              your experience!
            </p>
          </div>
        ) : (
          currentComments.map((comment) => (
            <div
              key={comment.id}
              className="bg-gray-700/70 dark:bg-gray-100/70 rounded-lg p-5 border-l-4 border-indigo-500 dark:border-indigo-600"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <div className="h-10 w-10 rounded-full bg-gray-600 dark:bg-gray-300 flex items-center justify-center text-xl">
                    {comment.avatar || '👤'}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  {' '}
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-white dark:text-gray-900">
                      {comment.authorName}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-xs text-red-500 hover:text-red-400 focus:outline-none"
                          aria-label="Delete comment"
                          title="Delete comment"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-300 dark:text-gray-600">
                    {comment.comment}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav
            className="inline-flex rounded-md shadow-sm -space-x-px"
            aria-label="Pagination"
          >
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                currentPage === 1
                  ? 'border-gray-700 bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'border-gray-600 bg-gray-700 text-gray-400 hover:bg-gray-600'
              } text-sm font-medium`}
            >
              <span className="sr-only">Previous</span>←
            </button>

            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`relative inline-flex items-center px-4 py-2 border ${
                  currentPage === index + 1
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                } text-sm font-medium`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
                currentPage === totalPages
                  ? 'border-gray-700 bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'border-gray-600 bg-gray-700 text-gray-400 hover:bg-gray-600'
              } text-sm font-medium`}
            >
              <span className="sr-only">Next</span>→
            </button>
          </nav>
        </div>
      )}

      <div className="mt-6 bg-gray-700 dark:bg-gray-200 rounded-lg p-5 border border-gray-600 dark:border-gray-300">
        <h4 className="font-medium text-white dark:text-gray-900 mb-2">
          Share Your Experience
        </h4>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
          Have you followed this education pathway? Share your tips, experiences
          or alternative options with others!
        </p>

        <div className="mb-3">
          <label className="flex items-center space-x-2 text-sm text-gray-300 dark:text-gray-600">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded border-gray-600 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Post anonymously</span>
          </label>
        </div>

        <div className="flex">
          <input
            type="text"
            placeholder={authLoading ? 'Loading...' : 'Write your comment...'}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={authLoading}
            className="flex-1 rounded-l-md border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-600 dark:bg-white text-white dark:text-gray-900"
          />
          <button
            type="button"
            onClick={handleSubmitComment}
            disabled={!commentText.trim() || authLoading}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white ${
              !commentText.trim() || authLoading
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            }`}
          >
            Comment
          </button>
        </div>

        {!isAuthenticated && !authLoading && (
          <p className="mt-2 text-xs text-amber-400 dark:text-amber-600">
            You are not signed in. Comments will be posted as a guest.
          </p>
        )}

        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          Comments are moderated and may take up to 24 hours to appear.
        </p>
      </div>
    </div>
  );
};

export default PathwayComments;
