'use client';

import { FC, useState } from 'react';

// Interface for pathway comments
interface PathwayComment {
  id: string;
  pathwayId: string;
  author: string;
  date: string;
  comment: string;
  avatar?: string;
}

// Sample comments data for education pathways - keyed by specific pathway IDs, not general categories
const pathwayComments: Record<string, PathwayComment[]> = {
  // Software Engineering pathway (Pathway ID: 1)
  '1': [
    {
      id: 'pathway1-comment-1',
      pathwayId: '1',
      author: 'Amirah',
      date: 'June 14, 2025',
      comment:
        'You guys can actually join Universiti Selangor Foundation in IT programme (1 year) then take Bachelor in Computer Science (3 years). The cost would be significantly low if you signed up for dermasiswa and got 3.65 CGPA for your PTPTN loan waiver',
      avatar: '👩‍💻',
    },
    {
      id: 'pathway1-comment-2',
      pathwayId: '1',
      author: 'Danial',
      date: 'June 12, 2025',
      comment:
        'I recommend checking out Asia Pacific University too. Their CS program has strong industry partnerships and lots of internship opportunities with tech companies in Cyberjaya.',
      avatar: '👨‍🎓',
    },
    {
      id: 'pathway1-comment-3',
      pathwayId: '1',
      author: 'Li Wei',
      date: 'June 10, 2025',
      comment:
        "If you're interested in studying overseas but worried about costs, look into the MARA scholarship programs. They often fund CS degrees abroad if you maintain good academic standing.",
      avatar: '🎓',
    },
  ],
  // Medical Doctor pathway (Pathway ID: 2)
  '2': [
    {
      id: 'pathway2-comment-1',
      pathwayId: '2',
      author: 'Dr. Siti',
      date: 'June 15, 2025',
      comment:
        'For aspiring doctors, I suggest considering the twinning programs at IMU or UCSI. You can do half your studies in Malaysia and half abroad, which saves significant costs while still getting international exposure.',
      avatar: '👩‍⚕️',
    },
    {
      id: 'pathway2-comment-2',
      pathwayId: '2',
      author: 'Raj',
      date: 'June 11, 2025',
      comment:
        'Medical foundation programs at Monash Malaysia or Newcastle Malaysia are great options. The competition is tough, but they have good progression rates to their MBBS programs.',
      avatar: '🧑‍⚕️',
    },
  ],
  // Business Management pathway (Pathway ID: 3)
  '3': [
    {
      id: 'pathway3-comment-1',
      pathwayId: '3',
      author: 'Faizal',
      date: 'June 13, 2025',
      comment:
        "Sunway's business program has a great reputation with employers. Their ACCA pathway also allows you to get your professional accounting qualification alongside your degree.",
      avatar: '💼',
    },
    {
      id: 'pathway3-comment-2',
      pathwayId: '3',
      author: 'Sarah',
      date: 'June 8, 2025',
      comment:
        "For those interested in entrepreneurship, consider UNIRAZAK's programs. They have specific tracks focused on building your own business and connections to startup incubators.",
      avatar: '📊',
    },
    {
      id: 'pathway3-comment-3',
      pathwayId: '3',
      author: 'Chong',
      date: 'May 25, 2025',
      comment:
        "If you're interested in international business, I'd strongly recommend taking an additional language like Mandarin or Spanish alongside your business degree.",
      avatar: '🌏',
    },
  ],
};

interface PathwayCommentsProps {
  pathwayId: string;
}

const PathwayComments: FC<PathwayCommentsProps> = ({ pathwayId }) => {
  const [commentText, setCommentText] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 3;
  // Get comments for this pathway - only exact matches by ID, no fallbacks
  const getCommentsForPathway = () => {
    // Return only comments that match this specific pathway ID
    return pathwayComments[pathwayId] || [];
  };

  const comments = getCommentsForPathway();

  // Sort comments based on sortOrder
  const sortedComments = [...comments].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // Calculate pagination
  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = sortedComments.slice(
    indexOfFirstComment,
    indexOfLastComment
  );
  const totalPages = Math.ceil(sortedComments.length / commentsPerPage);

  // Handle comment submission
  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;

    // This would typically send the comment to a backend API
    // For now, we'll just show a simple alert and clear the input
    alert('Comment submitted for moderation!');
    setCommentText('');
  };

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
      </div>{' '}
      <div className="space-y-6">
        {currentComments.length === 0 ? (
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
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-white dark:text-gray-900">
                      {comment.author}
                    </p>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {comment.date}
                    </span>
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
        <div className="flex">
          <input
            type="text"
            placeholder="Write your comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 rounded-l-md border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-600 dark:bg-white text-white dark:text-gray-900"
          />
          <button
            type="button"
            onClick={handleCommentSubmit}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Comment
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          Comments are moderated and may take up to 24 hours to appear.
        </p>
      </div>
    </div>
  );
};

export default PathwayComments;
