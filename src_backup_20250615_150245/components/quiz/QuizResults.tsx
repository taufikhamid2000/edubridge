import React from 'react';
import { Question } from '@/types/topics';
import { logger } from '@/lib/logger';

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  answers: Record<string, string[]>;
  questions: Question[];
  onRetake: () => void;
  onViewAll: () => void;
  isVerified?: boolean; // Quiz verification status
}

export default function QuizResults({
  score,
  totalQuestions,
  answers,
  questions,
  onRetake,
  onViewAll,
  isVerified = true,
}: QuizResultsProps) {
  const getStatusClass = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-blue-600 dark:text-blue-400';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStatusText = (score: number) => {
    if (score >= 80) return 'Excellent!';
    if (score >= 60) return 'Good job!';
    if (score >= 40) return 'Not bad!';
    return 'Keep practicing!';
  };

  const getShareText = () => {
    return `I scored ${score}% on the EduBridge quiz! Try it out!`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'My EduBridge Quiz Result',
          text: getShareText(),
          url: window.location.href,
        })
        .catch((error) => logger.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard
        .writeText(getShareText() + ' ' + window.location.href)
        .then(() => alert('Result copied to clipboard!'))
        .catch((err) => logger.error('Failed to copy: ', err));
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
        <div className="relative w-48 h-48 mx-auto mb-4">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e6e6e6"
              strokeWidth="10"
              className="dark:stroke-gray-700"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={
                score >= 60 ? '#4ade80' : score >= 40 ? '#facc15' : '#ef4444'
              }
              strokeWidth="10"
              strokeDasharray={`${score * 2.83} ${283 - score * 2.83}`}
              strokeDashoffset="70.75"
              className="transform -rotate-90 origin-center"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span className={`text-4xl font-bold ${getStatusClass(score)}`}>
                {score}%
              </span>
              <span className="block text-sm text-gray-500 dark:text-gray-400">
                Score
              </span>
            </div>
          </div>
        </div>{' '}
        <p className={`text-xl font-medium ${getStatusClass(score)} mb-2`}>
          {getStatusText(score)}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          You scored {score}% ({Math.round((score / 100) * totalQuestions)}/
          {totalQuestions} correct)
        </p>
        {/* Unverified quiz notice */}
        {!isVerified && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
              <strong>No points awarded:</strong> This was an unverified quiz
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
          <span className="block text-xl font-semibold">{totalQuestions}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Questions
          </span>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
          <span className="block text-xl font-semibold">
            {score >= 60 ? 'Passed' : 'Try Again'}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Status
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-8">
        <h3 className="text-lg font-medium mb-3">Performance Breakdown</h3>

        {questions.map((question, index) => {
          const userAnswerIds = answers[question.id] || [];
          const correctAnswerIds =
            question.answers?.filter((a) => a.is_correct).map((a) => a.id) ||
            [];

          let isCorrect = false;

          if (question.type === 'radio') {
            // For radio buttons, check if the selected option is correct
            isCorrect =
              correctAnswerIds.length === 1 &&
              userAnswerIds.includes(correctAnswerIds[0]);
          } else {
            // For checkboxes, all correct options must be selected and no incorrect ones
            const allCorrectSelected = correctAnswerIds.every((id) =>
              userAnswerIds.includes(id)
            );
            const noIncorrectSelected = !userAnswerIds.some(
              (id) => !correctAnswerIds.includes(id)
            );
            isCorrect = allCorrectSelected && noIncorrectSelected;
          }

          return (
            <div
              key={question.id}
              className={`p-3 rounded-md ${
                isCorrect
                  ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500'
                  : 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500'
              }`}
            >
              <div className="flex justify-between">
                <span className="font-medium">Question {index + 1}</span>
                <span
                  className={
                    isCorrect
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }
                >
                  {isCorrect ? 'Correct' : 'Incorrect'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div>
          <button
            onClick={onRetake}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors mb-3 sm:mb-0"
          >
            Retake Quiz
          </button>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            Share Result
          </button>
          <button
            onClick={onViewAll}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors text-gray-800 dark:text-gray-200"
          >
            View All Quizzes
          </button>
        </div>
      </div>
    </div>
  );
}
