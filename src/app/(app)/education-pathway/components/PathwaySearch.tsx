'use client';

import { FC } from 'react';

interface PathwaySearchProps {
  value: string;
  onChange: (query: string) => void;
}

const PathwaySearch: FC<PathwaySearchProps> = ({ value, onChange }) => {
  return (
    <div className="bg-gray-800 dark:bg-white shadow overflow-hidden rounded-md p-4">
      <label
        htmlFor="search"
        className="block text-sm font-medium text-gray-300 dark:text-gray-700"
      >
        Search Educational Pathways
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <input
          type="text"
          name="search"
          id="search"
          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-600 dark:border-gray-300 rounded-md bg-gray-700 dark:bg-white text-white dark:text-gray-900"
          placeholder="Search by career name or keyword..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />{' '}
        {value && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-300 dark:hover:text-gray-500"
              onClick={() => onChange('')}
            >
              <span className="sr-only">Clear search</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
      <div className="mt-2 text-sm text-gray-400 dark:text-gray-500">
        Search for a career or field of interest to discover suitable
        educational pathways
      </div>
    </div>
  );
};

export default PathwaySearch;
