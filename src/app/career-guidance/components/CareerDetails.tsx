'use client';

import { FC } from 'react';
import { useRouter } from 'next/navigation';
import { CareerPathway, EnhancedSubject } from '../types';
import { PublicSubject } from '@/services/subjectService';
import SubjectCategory from './SubjectCategory';
import { subjectMapping } from '../data';

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

  // Filter subjects to only include SPM subjects using our subject mapping
  const isSpmSubject = (subject: EnhancedSubject): boolean => {
    // Check if this subject ID exists in our subjectMapping
    // This ensures we only show subjects that are in our actual SPM subject list
    return !!subjectMapping[subject.id];
  };

  // Get filtered subjects for each category
  const getMustLearnSubjects = () => {
    const subjects = getSubjectsByIds(career.mustLearnIds);
    return subjects.filter(isSpmSubject);
  };

  const getShouldLearnSubjects = () => {
    const subjects = getSubjectsByIds(career.shouldLearnIds);
    return subjects.filter(isSpmSubject);
  };

  const getCanLearnSubjects = () => {
    const subjects = getSubjectsByIds(career.canLearnIds);
    return subjects.filter(isSpmSubject);
  };

  const mustLearnSubjects = getMustLearnSubjects();
  const shouldLearnSubjects = getShouldLearnSubjects();
  const canLearnSubjects = getCanLearnSubjects();

  return (
    <div id="career-details" className="mt-12 pt-4">
      {' '}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white dark:text-gray-900">
          {career.title}
        </h2>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-300 dark:text-gray-600">
          {career.description}
        </p>

        <div className="mt-4 bg-blue-950/30 dark:bg-blue-100/30 rounded-lg px-4 py-3 max-w-2xl mx-auto">
          <p className="text-sm text-blue-300 dark:text-blue-800">
            <span className="font-semibold">SPM Context:</span> The subjects
            shown below are relevant to your SPM studies and will help prepare
            you for this career path.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <SubjectCategory
          title="Must Learn"
          description="Essential SPM subjects for this career"
          colorScheme="red"
          subjects={mustLearnSubjects}
          isLoading={isLoading}
        />

        <SubjectCategory
          title="Should Learn"
          description="Recommended SPM subjects for proficiency"
          colorScheme="amber"
          subjects={shouldLearnSubjects}
          isLoading={isLoading}
        />

        <SubjectCategory
          title="Can Learn"
          description="Additional SPM subjects that may help"
          colorScheme="green"
          subjects={canLearnSubjects}
          isLoading={isLoading}
        />
      </div>
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
