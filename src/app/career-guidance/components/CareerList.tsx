'use client';

import { FC } from 'react';
import { CareerPathway } from '../types';

interface CareerListProps {
  careerPathways: CareerPathway[];
  onSelectCareer: (careerId: string) => void;
}

const CareerList: FC<CareerListProps> = ({
  careerPathways,
  onSelectCareer,
}) => {
  return (
    <div className="mt-20 pb-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white dark:text-gray-900">
          Not sure what you want to be yet?
        </h2>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-300 dark:text-gray-500">
          Explore these popular career paths to find your perfect match
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {careerPathways.map((career) => (
          <div
            key={career.id}
            className="bg-gray-800 dark:bg-white shadow rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 border border-gray-700 dark:border-gray-200"
            onClick={() => {
              onSelectCareer(career.id);
              // Scroll to the career details section
              document
                .getElementById('career-details')
                ?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <div className="px-6 py-6">
              <div className="mb-4 w-12 h-12 rounded-full bg-indigo-700/30 dark:bg-indigo-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-indigo-400 dark:text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white dark:text-gray-900">
                {career.title}
              </h3>
              <p className="mt-2 text-gray-400 dark:text-gray-500">
                {career.description}
              </p>
            </div>{' '}
            <div className="px-6 py-3 bg-gray-750 bg-opacity-50 dark:bg-gray-100 flex justify-between items-center">
              <span className="text-sm font-medium text-indigo-300 dark:text-indigo-600">
                View subjects
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-indigo-300 dark:text-indigo-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CareerList;
