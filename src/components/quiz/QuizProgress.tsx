import React from 'react';

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  answeredQuestions: number;
}

export default function QuizProgress({
  currentQuestion,
  totalQuestions,
  answeredQuestions,
}: QuizProgressProps) {
  const progressPercentage = (currentQuestion / totalQuestions) * 100;
  const completionPercentage = (answeredQuestions / totalQuestions) * 100;

  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2 text-sm text-gray-400 dark:text-gray-600">
        <span>
          Question {currentQuestion} of {totalQuestions}
        </span>
        <span>
          {answeredQuestions} answered ({Math.round(completionPercentage)}%)
        </span>
      </div>
      <div className="h-2 w-full bg-gray-700 dark:bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-2 bg-blue-600 dark:bg-blue-500 rounded-full"
          style={{ width: `${progressPercentage}%` }}
          role="progressbar"
          aria-valuenow={progressPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
        ></div>
      </div>
      <div className="h-2 w-full bg-gray-700 dark:bg-gray-200 rounded-full overflow-hidden mt-1">
        <div
          className="h-2 bg-green-500 dark:bg-green-400 rounded-full"
          style={{ width: `${completionPercentage}%` }}
          role="progressbar"
          aria-valuenow={completionPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Completion progress"
        ></div>
      </div>
    </div>
  );
}
