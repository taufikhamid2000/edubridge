import React from 'react';
import { Question } from '@/types/topics';

interface QuizQuestionProps {
  question: Question;
  selectedAnswers: string[];
  onAnswerChange: (selectedAnswers: string[]) => void;
}

export default function QuizQuestion({
  question,
  selectedAnswers,
  onAnswerChange,
}: QuizQuestionProps) {
  const handleRadioChange = (answerId: string) => {
    onAnswerChange([answerId]);
  };

  const handleCheckboxChange = (answerId: string) => {
    const isSelected = selectedAnswers.includes(answerId);
    if (isSelected) {
      // Remove the answer
      onAnswerChange(selectedAnswers.filter((id) => id !== answerId));
    } else {
      // Add the answer
      onAnswerChange([...selectedAnswers, answerId]);
    }
  };

  if (!question.answers || question.answers.length === 0) {
    return (
      <div className="py-4">
        <h3 className="text-lg font-medium mb-4">{question.text}</h3>
        <p className="text-yellow-600 dark:text-yellow-400">
          No answer options available for this question.
        </p>
      </div>
    );
  }

  return (
    <div className="py-4">
      <h3 className="text-lg font-medium mb-4">{question.text}</h3>
      <div className="space-y-3">
        {question.answers.map((answer) => (
          <div key={answer.id} className="flex items-start">
            {question.type === 'radio' ? (
              <input
                type="radio"
                id={answer.id}
                name={`question-${question.id}`}
                value={answer.id}
                checked={selectedAnswers.includes(answer.id)}
                onChange={() => handleRadioChange(answer.id)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                aria-labelledby={`label-${answer.id}`}
              />
            ) : (
              <input
                type="checkbox"
                id={answer.id}
                name={`question-${question.id}`}
                value={answer.id}
                checked={selectedAnswers.includes(answer.id)}
                onChange={() => handleCheckboxChange(answer.id)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 rounded border-gray-300 dark:border-gray-600"
                aria-labelledby={`label-${answer.id}`}
              />
            )}
            <label
              id={`label-${answer.id}`}
              htmlFor={answer.id}
              className="ml-3 block text-gray-700 dark:text-gray-200"
            >
              {answer.text}
            </label>
          </div>
        ))}
      </div>

      {question.type === 'checkbox' && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Select all that apply
        </p>
      )}
    </div>
  );
}
