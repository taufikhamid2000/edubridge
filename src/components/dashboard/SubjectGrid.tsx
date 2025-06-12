import React from 'react';

interface Subject {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  category?: string;
  category_priority?: number;
  order_index?: number;
}

interface SubjectGridProps {
  subjects: Subject[];
  error: string | null;
  currentPage: number;
  totalPages: number;
  handleSubjectClick: (subject: Subject) => void;
  handlePageChange: (pageNumber: number) => void;
}

const SubjectGrid = ({
  subjects,
  error,
  currentPage,
  totalPages,
  handleSubjectClick,
  handlePageChange,
}: SubjectGridProps) => {
  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {error ? (
          <div className="text-red-500 bg-red-100 p-3 sm:p-4 rounded dark:bg-red-900">
            Error loading subjects: {error}
          </div>
        ) : subjects.length === 0 ? (
          <div className="text-center p-3 sm:p-4 dark:text-gray-300 col-span-3">
            <p>
              No subjects found matching your search or filter. Try different
              criteria.
            </p>
          </div>
        ) : (
          subjects.map((subject) => (
            <div
              key={subject.id}
              onClick={() => handleSubjectClick(subject)}
              className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="text-blue-500 text-2xl">
                  {/* Display icon from subject data */}
                  {subject.icon ? (
                    <span>{subject.icon}</span>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  )}
                </div>
                <h3 className="text-lg font-medium">{subject.name}</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {subject.description.length > 120
                  ? `${subject.description.substring(0, 120)}...`
                  : subject.description}
              </p>
              {subject.category && (
                <div className="mt-3">
                  <span className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
                    {subject.category}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-1">
          <button
            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded ${
              currentPage === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700'
            }`}
          >
            &lt;
          </button>
          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => handlePageChange(number)}
              className={`px-3 py-1 rounded ${
                number === currentPage
                  ? 'bg-blue-500 text-white'
                  : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700'
              }`}
            >
              {number}
            </button>
          ))}
          <button
            onClick={() =>
              currentPage < totalPages && handlePageChange(currentPage + 1)
            }
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded ${
              currentPage === totalPages
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700'
            }`}
          >
            &gt;
          </button>
        </div>
      )}
    </>
  );
};

export default SubjectGrid;
