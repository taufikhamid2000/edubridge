'use client';

import { FC } from 'react';
import { EducationPathway, EducationOption } from '../types';

interface PathwayDetailsProps {
  pathway: EducationPathway;
}

const PathwayDetails: FC<PathwayDetailsProps> = ({ pathway }) => {
  return (
    <div className="bg-gray-800 dark:bg-white shadow overflow-hidden rounded-md">
      <div className="px-4 py-5 border-b border-gray-700 dark:border-gray-200 sm:px-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg leading-6 font-medium text-white dark:text-gray-900">
            {pathway.career}
          </h3>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              pathway.careerOutlook.demand === 'high'
                ? 'bg-green-900 text-green-200 dark:bg-green-100 dark:text-green-800'
                : pathway.careerOutlook.demand === 'medium'
                  ? 'bg-yellow-900 text-yellow-200 dark:bg-yellow-100 dark:text-yellow-800'
                  : 'bg-red-900 text-red-200 dark:bg-red-100 dark:text-red-800'
            }`}
          >
            {pathway.careerOutlook.demand.charAt(0).toUpperCase() +
              pathway.careerOutlook.demand.slice(1)}{' '}
            demand
          </span>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-gray-300 dark:text-gray-500">
          {pathway.description}
        </p>
        <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-400 dark:text-gray-500">
              Salary Range
            </dt>
            <dd className="mt-1 text-sm text-gray-100 dark:text-gray-900">
              RM {pathway.careerOutlook.salaryRange.min.toLocaleString()} - RM{' '}
              {pathway.careerOutlook.salaryRange.max.toLocaleString()} /month
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-400 dark:text-gray-500">
              Growth Outlook
            </dt>
            <dd className="mt-1 text-sm text-gray-100 dark:text-gray-900">
              {pathway.careerOutlook.growthOutlook}
            </dd>
          </div>
        </div>
      </div>{' '}
      <div className="px-4 py-5 sm:p-6">
        <div className="space-y-8">
          {pathway.pathways.map((step, index) => (
            <div
              key={index}
              className="border-l-2 border-indigo-500 pl-4 -ml-px"
            >
              <h4 className="text-lg font-medium text-white dark:text-gray-900">
                {step.title}
                <span className="ml-2 text-sm font-normal text-gray-400 dark:text-gray-500">
                  ({step.duration})
                </span>
              </h4>
              <p className="mt-1 text-sm text-gray-300 dark:text-gray-600">
                {step.description}
              </p>

              <div className="mt-4 space-y-4">
                {step.options.map((option, optionIndex) => (
                  <EducationOptionCard key={optionIndex} option={option} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface EducationOptionCardProps {
  option: EducationOption;
}

const EducationOptionCard: FC<EducationOptionCardProps> = ({ option }) => {
  return (
    <div className="bg-gray-700 dark:bg-gray-50 rounded-md p-4">
      <h5 className="text-sm font-medium text-white dark:text-gray-900">
        {option.name}
      </h5>
      <p className="mt-1 text-sm text-gray-300 dark:text-gray-600">
        {option.description}
      </p>
      {option.institutions && option.institutions.length > 0 && (
        <div className="mt-3">
          <h6 className="text-xs font-medium text-gray-400 dark:text-gray-500">
            Example Institutions
          </h6>
          <div className="mt-1 flex flex-wrap gap-1">
            {option.institutions.map((institution, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-600 text-gray-200 dark:bg-gray-100 dark:text-gray-800"
              >
                {institution}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <h6 className="text-xs font-medium text-gray-400 dark:text-gray-500">
            Advantages
          </h6>
          <ul className="mt-1 text-xs text-gray-300 dark:text-gray-600 list-disc list-inside space-y-1">
            {option.advantages.map((adv, i) => (
              <li key={i}>{adv}</li>
            ))}
          </ul>
        </div>
        <div>
          <h6 className="text-xs font-medium text-gray-400 dark:text-gray-500">
            Challenges
          </h6>
          <ul className="mt-1 text-xs text-gray-300 dark:text-gray-600 list-disc list-inside space-y-1">
            {option.challenges.map((challenge, i) => (
              <li key={i}>{challenge}</li>
            ))}
          </ul>
        </div>
      </div>
      {option.requirements && (
        <div className="mt-3">
          <h6 className="text-xs font-medium text-gray-400 dark:text-gray-500">
            Requirements
          </h6>
          <ul className="mt-1 text-xs text-gray-300 dark:text-gray-600 list-disc list-inside space-y-1">
            {option.requirements.map((req, i) => (
              <li key={i}>{req}</li>
            ))}
          </ul>
        </div>
      )}{' '}
      {option.link && (
        <div className="mt-3">
          <a
            href={option.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-indigo-400 dark:text-indigo-600 hover:text-indigo-300 dark:hover:text-indigo-500"
          >
            Learn more about this option
            <svg
              className="inline-block ml-1 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
};

export default PathwayDetails;
