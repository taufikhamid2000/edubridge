'use client';

import { FC, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { CareerPathway, EnhancedSubject } from '../types';
import { PublicSubject } from '@/services/subjectService';
import SubjectCategory from './SubjectCategory';
import { subjectMapping } from '../data';
import { useCareerComments } from '../hooks/useCareerComments';

interface CareerDetailsProps {
  career: CareerPathway;
  subjects?: PublicSubject[]; // Made optional since we're not using it directly
  isLoading: boolean;
  getSubjectsByIds: (subjectIds: string[]) => EnhancedSubject[];
  contributionInfo?: {
    submitterName: string;
    submitterEmail?: string;
    additionalNotes?: string;
  };
}

const CareerDetails: FC<CareerDetailsProps> = ({
  career,
  isLoading,
  getSubjectsByIds,
  contributionInfo,
}) => {
  const router = useRouter();
  const [showContributorDetails, setShowContributorDetails] = useState(false);

  // Use the career comments hook
  const {
    comments,
    totalComments,
    isLoading: isLoadingComments,
    error: commentsError,
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
  } = useCareerComments(career.id);

  // Filter subjects to only include SPM subjects using our subject mapping
  const isSpmSubject = (subject: EnhancedSubject): boolean => {
    // Check if this subject ID exists in our subjectMapping
    // This ensures we only show subjects that are in our actual SPM subject list
    return !!subjectMapping[subject.id];
  };

  // Get filtered subjects for each category
  const getMustLearnSubjects = () => {
    const subjects = getSubjectsByIds(career.mustLearnIds);
    return subjects.filter(isSpmSubject);
  };

  const getShouldLearnSubjects = () => {
    const subjects = getSubjectsByIds(career.shouldLearnIds);
    return subjects.filter(isSpmSubject);
  };

  const getCanLearnSubjects = () => {
    const subjects = getSubjectsByIds(career.canLearnIds);
    return subjects.filter(isSpmSubject);
  };

  const mustLearnSubjects = getMustLearnSubjects();
  const shouldLearnSubjects = getShouldLearnSubjects();
  const canLearnSubjects = getCanLearnSubjects();

  return (
    <div id="career-details" className="mt-12 pt-4">
      {' '}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white dark:text-gray-900">
          {career.title}
        </h2>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-300 dark:text-gray-600">
          {career.description}
        </p>{' '}
        <div className="mt-4 bg-blue-950/30 dark:bg-blue-100/30 rounded-lg px-4 py-3 max-w-2xl mx-auto">
          <details className="mt-2">
            <summary className="cursor-pointer text-sm font-medium text-blue-400 dark:text-blue-700 hover:text-blue-300 dark:hover:text-blue-600">
              Important note about SPM requirements
            </summary>
            <div className="mt-2 text-sm text-blue-300 dark:text-blue-800 pl-4 border-l-2 border-blue-800/30 dark:border-blue-300/30">
              <p className="text-sm text-blue-300 dark:text-blue-800">
                <span className="font-semibold">SPM Context:</span> The subjects
                shown below are relevant to your SPM studies and will help
                prepare you for this career path.
              </p>
              <p>
                <span className="font-semibold">Mandatory Subjects:</span>{' '}
                Remember that Bahasa Melayu and Sejarah are mandatory pass
                subjects for SPM regardless of your career path. All Malaysian
                students must pass these core subjects to obtain their SPM
                certificate.
              </p>
            </div>
          </details>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <SubjectCategory
          title="Must Learn"
          description="Essential SPM subjects for this career"
          colorScheme="red"
          subjects={mustLearnSubjects}
          isLoading={isLoading}
        />
        <SubjectCategory
          title="Should Learn"
          description="Recommended SPM subjects for proficiency"
          colorScheme="amber"
          subjects={shouldLearnSubjects}
          isLoading={isLoading}
        />
        <SubjectCategory
          title="Can Learn"
          description="Additional SPM subjects that may help"
          colorScheme="green"
          subjects={canLearnSubjects}
          isLoading={isLoading}
        />{' '}
      </div>
      {contributionInfo && (
        <div className="mt-10 bg-gray-800 dark:bg-gray-100 rounded-lg p-5 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-white dark:text-gray-900">
              Contributor Information
            </h3>
            <button
              onClick={() => setShowContributorDetails(!showContributorDetails)}
              className="text-blue-400 dark:text-blue-700 hover:text-blue-300 dark:hover:text-blue-600 focus:outline-none"
            >
              {showContributorDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>

          {showContributorDetails && (
            <div className="space-y-4">
              {/* Contributor Info */}
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {contributionInfo.submitterName
                      ? contributionInfo.submitterName.charAt(0).toUpperCase()
                      : '?'}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-white dark:text-gray-800 font-medium">
                    {contributionInfo.submitterName || 'Anonymous Contributor'}
                  </p>
                  {contributionInfo.submitterEmail && (
                    <p className="text-gray-400 dark:text-gray-500 text-sm">
                      {contributionInfo.submitterEmail}
                    </p>
                  )}
                </div>
              </div>

              {/* Additional Notes */}
              {contributionInfo.additionalNotes && (
                <div>
                  <h4 className="text-lg font-medium text-white dark:text-gray-900 mt-4">
                    Additional Notes
                  </h4>
                  <div className="mt-2 bg-gray-700/50 dark:bg-gray-200/50 rounded-md p-4">
                    <p className="text-gray-300 dark:text-gray-600">
                      {contributionInfo.additionalNotes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}{' '}
      {/* Comments Section */}
      <div className="mt-12 mb-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-white dark:text-gray-900">
            Student Feedback & Experiences
          </h3>{' '}
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
          {isLoadingComments ? (
            <div className="text-center py-8">
              <p className="text-gray-400 dark:text-gray-600">
                Loading comments...
              </p>
            </div>
          ) : commentsError ? (
            <div className="text-center py-8">
              <p className="text-red-400 dark:text-red-600">
                Error loading comments. Please try again later.
              </p>
            </div>
          ) : totalComments === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 dark:text-gray-600">
                No comments yet. Be the first to share your experience!
              </p>
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-gray-800/70 dark:bg-white/70 rounded-lg p-5 border-l-4 border-indigo-500 dark:border-indigo-600"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <div className="h-10 w-10 rounded-full bg-gray-700 dark:bg-gray-200 flex items-center justify-center text-xl">
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
                {/* Admin delete button */}
                {isAdmin && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete Comment
                    </button>
                  </div>
                )}
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
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
        )}{' '}
        <div className="mt-6 bg-gray-750 dark:bg-gray-100 rounded-lg p-5 border border-gray-700 dark:border-gray-300">
          <h4 className="font-medium text-white dark:text-gray-900 mb-2">
            Share Your Experience
          </h4>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
            Have you followed this career guidance in your studies? Let others
            know about your experience or ask questions!
          </p>{' '}
          <div className="space-y-4">
            <div className="flex">
              <input
                type="text"
                placeholder="Write your comment..."
                className="flex-1 rounded-l-md border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 dark:bg-white text-white dark:text-gray-900"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={handleSubmitComment}
              >
                Comment
              </button>
            </div>

            {/* Anonymous checkbox */}
            <div className="flex items-center">
              <input
                id="anonymous-checkbox"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-500 rounded"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
              <label
                htmlFor="anonymous-checkbox"
                className="ml-2 block text-sm text-gray-400 dark:text-gray-500"
              >
                Post anonymously
              </label>
            </div>

            {!isAuthenticated && !authLoading && (
              <p className="text-xs text-yellow-400 dark:text-yellow-600">
                You&apos;re not logged in. Your comment will be posted
                anonymously unless you{' '}
                <a href="/login" className="underline">
                  log in
                </a>{' '}
                first.
              </p>
            )}
          </div>
          <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
            Comments are moderated and may take up to 24 hours to appear.
          </p>
        </div>
      </div>
      <div className="mt-8 text-center space-x-4">
        <button
          type="button"
          className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 focus:ring-offset-gray-900"
          onClick={() => router.push(`/dashboard?career=${career.id}`)}
        >
          Start Learning These Subjects
        </button>
        <button
          type="button"
          className="inline-flex items-center px-5 py-3 border border-gray-600 text-base font-medium rounded-md shadow-sm text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 focus:ring-offset-gray-900"
          onClick={() => router.push('/')}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default CareerDetails;
