'use client';

import { FC } from 'react';
import { EnhancedSubject } from '../types';

interface SubjectCardProps {
  subject: EnhancedSubject;
  colorScheme: 'red' | 'amber' | 'green';
}

const SubjectCard: FC<SubjectCardProps> = ({ subject, colorScheme }) => {
  const colorClasses = {
    red: {
      topic: 'bg-red-800/30 text-red-300',
    },
    amber: {
      topic: 'bg-amber-800/30 text-amber-300',
    },
    green: {
      topic: 'bg-green-800/30 text-green-300',
    },
  };

  return (
    <li className="py-4">
      <h4 className="text-lg font-semibold text-white dark:text-gray-900">
        {subject.name}
      </h4>
      <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
        {subject.description}
      </p>{' '}
      {subject.topics && subject.topics.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {subject.topics.map((topic: string, idx: number) => (
            <span
              key={idx}
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[colorScheme].topic}`}
            >
              {topic}
            </span>
          ))}
        </div>
      )}
    </li>
  );
};

export default SubjectCard;
