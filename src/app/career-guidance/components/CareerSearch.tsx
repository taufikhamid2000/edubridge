'use client';

import { FC, useState, useMemo } from 'react';
import { CareerPathway } from '../types';

interface CareerSearchProps {
  careerPathways: CareerPathway[];
  onSelectCareer: (careerId: string) => void;
}

const CareerSearch: FC<CareerSearchProps> = ({
  careerPathways,
  onSelectCareer,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filter careers based on search term
  const filteredCareers = useMemo(() => {
    if (!searchTerm) return [];

    return careerPathways.filter((career) =>
      career.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, careerPathways]);

  return (
    <div className="mt-12 max-w-lg mx-auto">
      {' '}
      <label
        htmlFor="career-search"
        className="block text-sm font-medium text-gray-300 dark:text-gray-700"
      >
        Search for a career to see required subjects:
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <input
          type="text"
          name="career-search"
          id="career-search"
          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-4 pr-12 py-3 sm:text-lg border-gray-600 rounded-md bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:border-gray-300"
          placeholder="Type a career title (e.g., Software Engineer, Doctor, Accountant)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>{' '}
      {searchTerm && (
        <ul className="mt-2 bg-gray-800 dark:bg-white shadow-md rounded-md divide-y divide-gray-700 dark:divide-gray-200">
          {filteredCareers.length > 0 ? (
            filteredCareers.map((career) => (
              <li
                key={career.id}
                className="px-4 py-3 cursor-pointer hover:bg-gray-700 dark:hover:bg-gray-50"
                onClick={() => {
                  onSelectCareer(career.id);
                  setSearchTerm('');
                }}
              >
                <div className="flex items-center">
                  <div className="text-lg font-medium text-white dark:text-gray-900">
                    {career.title}
                  </div>
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-800 text-indigo-200 dark:bg-indigo-100 dark:text-indigo-800">
                    Click to view subjects
                  </span>
                </div>
                <div className="text-sm text-gray-400 dark:text-gray-500">
                  {career.description}
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-3">
              <div className="text-center">
                <p className="text-gray-400 dark:text-gray-500">
                  No matching careers found
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Try a different search term or browse the careers below
                </p>
              </div>
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default CareerSearch;
