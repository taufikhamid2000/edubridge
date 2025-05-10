/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';

// Function to generate a random alphanumeric code of specified length
const generateQuizCode = (length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

interface QuizFormProps {
  register: any;
  handleSubmit: any;
  errors: any;
  onSubmit: any;
  isLoading?: boolean;
  subjectName?: string;
  chapterName?: string;
  topicName?: string;
}

export function QuizForm({
  register,
  handleSubmit,
  errors,
  onSubmit,
  isLoading = false,
  subjectName,
  chapterName,
  topicName,
}: QuizFormProps) {
  const [questionCount] = useState(3);
  const [quizCode] = useState(() => generateQuizCode());

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Quiz Context Information */}
      {(subjectName || chapterName || topicName) && (
        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mb-6">
          <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
            Quiz Context
          </h3>
          <dl className="grid grid-cols-1 gap-2 text-sm">
            {subjectName && (
              <div className="flex">
                <dt className="font-medium text-gray-500 dark:text-gray-400 w-24">
                  Subject:
                </dt>
                <dd className="text-gray-800 dark:text-gray-200">
                  {subjectName}
                </dd>
              </div>
            )}
            {chapterName && (
              <div className="flex">
                <dt className="font-medium text-gray-500 dark:text-gray-400 w-24">
                  Chapter:
                </dt>
                <dd className="text-gray-800 dark:text-gray-200">
                  {chapterName}
                </dd>
              </div>
            )}
            {topicName && (
              <div className="flex">
                <dt className="font-medium text-gray-500 dark:text-gray-400 w-24">
                  Topic:
                </dt>
                <dd className="text-gray-800 dark:text-gray-200">
                  {topicName}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Quiz Basic Information */}
      <div className="space-y-4">
        {' '}
        <div className="space-y-2">
          <label
            htmlFor="quizName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Quiz Code
          </label>
          <div className="relative">
            <input
              id="quizName"
              className="w-full px-3 py-2 border rounded-md shadow-sm bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-mono"
              readOnly
              value={quizCode}
              {...register('name', {
                required: true,
                value: quizCode,
              })}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Auto-generated unique quiz identifier
          </p>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Description
          </label>{' '}
          <textarea
            id="description"
            rows={3}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
              ${errors.description ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700 dark:bg-gray-800'}`}
            placeholder="Describe what this quiz covers"
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.description.message}
            </p>
          )}
        </div>{' '}
        <div className="space-y-2 opacity-50">
          <label
            htmlFor="difficulty"
            className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Difficulty Level
            <span className="ml-2 text-xs py-0.5 px-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
              Coming soon
            </span>
          </label>
          <select
            id="difficulty"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-not-allowed"
            disabled
            {...register('difficulty')}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>{' '}
        <div className="space-y-2 opacity-50">
          <label
            htmlFor="timeLimit"
            className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Time Limit (minutes)
            <span className="ml-2 text-xs py-0.5 px-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
              Coming soon
            </span>
          </label>
          <input
            id="timeLimit"
            type="number"
            min="1"
            max="120"
            disabled
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-md shadow-sm cursor-not-allowed"
            placeholder="Time limit in minutes"
            {...register('timeLimit')}
          />
        </div>{' '}
        <div className="space-y-2 opacity-50">
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
            Number of Questions
            <span className="ml-2 text-xs py-0.5 px-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
              Coming soon
            </span>
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="1"
              max="20"
              disabled
              value={questionCount}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-not-allowed"
            />
            <span className="w-8 text-center">{questionCount}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Default questions will be added after creating the quiz
          </p>
        </div>
        <div className="flex items-center mt-2 opacity-50">
          <input
            id="isPublic"
            type="checkbox"
            disabled
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-not-allowed"
            {...register('isPublic')}
          />
          <label
            htmlFor="isPublic"
            className="ml-2 flex items-center text-sm text-gray-700 dark:text-gray-300"
          >
            Make this quiz public
            <span className="ml-2 text-xs py-0.5 px-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
              Coming soon
            </span>
          </label>
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-3 text-white font-medium rounded-md shadow-sm 
            bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
            focus:ring-blue-500 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Creating Quiz...' : 'Create Quiz'}
        </button>
      </div>
    </form>
  );
}
