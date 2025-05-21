'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
}: PaginationProps) {
  // Generate an array of page numbers to display
  const getPageNumbers = () => {
    const delta = 1; // How many pages to show before and after current page
    const pages = [];

    // Always include first page
    pages.push(1);

    // Calculate range around current page
    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

    // Add ellipsis if there's a gap after first page
    if (rangeStart > 2) {
      pages.push(-1); // -1 represents ellipsis
    }

    // Add pages in range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    // Add ellipsis if there's a gap before last page
    if (rangeEnd < totalPages - 1) {
      pages.push(-2); // -2 represents ellipsis (different key from previous one)
    }

    // Always include last page if it exists
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Showing{' '}
            <span className="font-medium">
              {totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </span>{' '}
            to{' '}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, totalItems)}
            </span>{' '}
            of <span className="font-medium">{totalItems}</span> results
          </p>
        </div>
        <div>
          <nav
            className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
            aria-label="Pagination"
          >
            {/* Previous Page Button */}
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === 1
                  ? 'text-gray-300 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-600'
                  : 'text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              <span className="sr-only">Previous</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Page Numbers */}
            {pageNumbers.map((pageNumber, index) => {
              // Render ellipsis
              if (pageNumber < 0) {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
                  >
                    ...
                  </span>
                );
              }

              // Render page number
              return (
                <button
                  key={pageNumber}
                  onClick={() => onPageChange(pageNumber)}
                  aria-current={pageNumber === currentPage ? 'page' : undefined}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    pageNumber === currentPage
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900 dark:border-blue-500 dark:text-blue-300'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            {/* Next Page Button */}
            <button
              onClick={() =>
                onPageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages || totalPages === 0}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === totalPages || totalPages === 0
                  ? 'text-gray-300 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-600'
                  : 'text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              <span className="sr-only">Next</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </nav>
        </div>
      </div>

      {/* Mobile Pagination */}
      <div className="flex items-center justify-between w-full sm:hidden">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
            currentPage === 1
              ? 'text-gray-300 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-600'
              : 'text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'
          }`}
        >
          Previous
        </button>
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {currentPage} of {totalPages}
        </div>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
            currentPage === totalPages || totalPages === 0
              ? 'text-gray-300 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-600'
              : 'text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
