'use client';

import { FC } from 'react';
import { useRouter } from 'next/navigation';
import { CareerPathway, EnhancedSubject } from '../types';
import { PublicSubject } from '@/services/subjectService';
import SubjectCard from './SubjectCard';

interface CareerDetailsProps {
  career: CareerPathway;
  subjects?: PublicSubject[]; // Made optional since we're not using it directly
  isLoading: boolean;
  getSubjectsByIds: (subjectIds: string[]) => EnhancedSubject[];
}

const CareerDetails: FC<CareerDetailsProps> = ({
  career,
  isLoading,
  getSubjectsByIds,
}) => {
  const router = useRouter();

  return (
    <div id="career-details" className="mt-12 pt-4">
      {' '}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white">{career.title}</h2>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-300">
          {career.description}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {' '}
        {/* Must Learn Section */}
        <div className="bg-red-950/30 rounded-lg shadow-lg overflow-hidden border border-red-900/30">
          <div className="px-6 py-4 bg-red-500/80">
            <h3 className="text-lg font-bold text-white">Must Learn</h3>
            <p className="text-red-100 text-sm">
              Essential subjects for this career
            </p>
          </div>
          <div className="px-6 py-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400"></div>
              </div>
            ) : (
              <ul className="divide-y divide-red-900/50">
                {career.mustLearnIds.map((subjectId) => {
                  const subjects = getSubjectsByIds([subjectId]);
                  const subject = subjects[0];
                  return subject ? (
                    <SubjectCard
                      key={subjectId}
                      subject={subject}
                      colorScheme="red"
                    />
                  ) : null;
                })}
              </ul>
            )}
          </div>
        </div>{' '}
        {/* Should Learn Section */}
        <div className="bg-amber-950/30 rounded-lg shadow-lg overflow-hidden border border-amber-900/30">
          <div className="px-6 py-4 bg-amber-500/80">
            <h3 className="text-lg font-bold text-white">Should Learn</h3>
            <p className="text-amber-100 text-sm">
              Recommended subjects for proficiency
            </p>
          </div>
          <div className="px-6 py-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
              </div>
            ) : (
              <ul className="divide-y divide-amber-900/50">
                {career.shouldLearnIds.map((subjectId) => {
                  const subjects = getSubjectsByIds([subjectId]);
                  const subject = subjects[0];
                  return subject ? (
                    <SubjectCard
                      key={subjectId}
                      subject={subject}
                      colorScheme="amber"
                    />
                  ) : null;
                })}
              </ul>
            )}
          </div>
        </div>{' '}
        {/* Can Learn Section */}
        <div className="bg-green-950/30 rounded-lg shadow-lg overflow-hidden border border-green-900/30">
          <div className="px-6 py-4 bg-green-500/80">
            <h3 className="text-lg font-bold text-white">Can Learn</h3>
            <p className="text-green-100 text-sm">
              Additional subjects for specialization
            </p>
          </div>
          <div className="px-6 py-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
              </div>
            ) : (
              <ul className="divide-y divide-green-900/50">
                {career.canLearnIds.map((subjectId) => {
                  const subjects = getSubjectsByIds([subjectId]);
                  const subject = subjects[0];
                  return subject ? (
                    <SubjectCard
                      key={subjectId}
                      subject={subject}
                      colorScheme="green"
                    />
                  ) : null;
                })}
              </ul>
            )}
          </div>
        </div>
      </div>{' '}
      <div className="mt-8 text-center space-x-4">
        <button
          type="button"
          className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 focus:ring-offset-gray-900"
          onClick={() => router.push(`/dashboard?career=${career.id}`)}
        >
          Start Learning These Subjects
        </button>
        <button
          type="button"
          className="inline-flex items-center px-5 py-3 border border-gray-600 text-base font-medium rounded-md shadow-sm text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 focus:ring-offset-gray-900"
          onClick={() => router.push('/')}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default CareerDetails;
