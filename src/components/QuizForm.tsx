/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';

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
  topicName
}: QuizFormProps) {
  const [questionCount, setQuestionCount] = useState(3);
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Quiz Context Information */}
      {(subjectName || chapterName || topicName) && (
        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mb-6">
          <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Quiz Context</h3>
          <dl className="grid grid-cols-1 gap-2 text-sm">
            {subjectName && (
              <div className="flex">
                <dt className="font-medium text-gray-500 dark:text-gray-400 w-24">Subject:</dt>
                <dd className="text-gray-800 dark:text-gray-200">{subjectName}</dd>
              </div>
            )}
            {chapterName && (
              <div className="flex">
                <dt className="font-medium text-gray-500 dark:text-gray-400 w-24">Chapter:</dt>
                <dd className="text-gray-800 dark:text-gray-200">{chapterName}</dd>
              </div>
            )}
            {topicName && (
              <div className="flex">
                <dt className="font-medium text-gray-500 dark:text-gray-400 w-24">Topic:</dt>
                <dd className="text-gray-800 dark:text-gray-200">{topicName}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Quiz Basic Information */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label 
            htmlFor="quizName" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Quiz Name*
          </label>
          <input 
            id="quizName" 
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
              ${errors.name ? 
                'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-700' : 
                'border-gray-300 dark:border-gray-700 dark:bg-gray-800'
              }`}
            placeholder="Enter descriptive quiz name" 
            {...register('name', { 
              required: 'Quiz name is required',
              minLength: { value: 5, message: 'Quiz name should be at least 5 characters' }
            })} 
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.name.message}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <label 
            htmlFor="description" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Description
          </label>
          <textarea 
            id="description" 
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe what this quiz covers"
            {...register('description')} 
          />
        </div>

        <div className="space-y-2">
          <label 
            htmlFor="difficulty" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Difficulty Level
          </label>
          <select
            id="difficulty"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('difficulty')}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div className="space-y-2">
          <label 
            htmlFor="timeLimit" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Time Limit (minutes)
          </label>
          <input 
            id="timeLimit" 
            type="number"
            min="1"
            max="120"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Time limit in minutes"
            {...register('timeLimit', { 
              min: { value: 1, message: 'Time limit must be at least 1 minute' },
              max: { value: 120, message: 'Time limit cannot exceed 120 minutes' }
            })} 
          />
          {errors.timeLimit && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.timeLimit.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Number of Questions
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="1"
              max="20"
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="w-8 text-center">{questionCount}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            You'll be able to add {questionCount} questions after creating the quiz
          </p>
        </div>

        <div className="flex items-center mt-2">
          <input
            id="isPublic"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            {...register('isPublic')}
          />
          <label
            htmlFor="isPublic"
            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
          >
            Make this quiz public
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