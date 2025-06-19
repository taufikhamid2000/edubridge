'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { fetchPublicSubjects, PublicSubject } from '@/services/subjectService';
import { careerPathways } from './data';
import { useSubjectMatcher } from './hooks/useSubjectMatcher';
import CareerSearch from './components/CareerSearch';
import CareerDetails from './components/CareerDetails';
import CareerList from './components/CareerList';

export default function CareerGuidancePage() {
  const router = useRouter();
  const [selectedCareerId, setSelectedCareerId] = useState<string>('');
  const [subjects, setSubjects] = useState<PublicSubject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load all subjects from the API
  useEffect(() => {
    async function loadSubjects() {
      try {
        const { data, error } = await fetchPublicSubjects();
        if (error || !data) {
          console.error('Error loading subjects:', error);
          return;
        }
        setSubjects(data);
      } catch (err) {
        console.error('Error fetching subjects:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSubjects();
  }, []);

  // Get selected career details
  const selectedCareer = careerPathways.find(
    (career) => career.id === selectedCareerId
  );

  // Use the custom hook to get the subject matcher
  const { getSubjectsByIds } = useSubjectMatcher(subjects);

  // Handle selecting a career
  const handleSelectCareer = (careerId: string) => {
    setSelectedCareerId(careerId);
  };

  return (
    <>
      <Head>
        <title>Career Guidance - EduBridge</title>
      </Head>
      <div className="min-h-screen bg-gray-900 dark:bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white dark:text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Career Guidance
            </h1>{' '}
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-300 dark:text-gray-500">
              Discover the subjects you need to learn to achieve your dream
              career
            </p>
          </div>
          {/* Career Search Component */}
          <CareerSearch
            careerPathways={careerPathways}
            onSelectCareer={handleSelectCareer}
          />{' '}
          {/* Career Details Component - Only shown when a career is selected */}
          {selectedCareer && (
            <CareerDetails
              career={selectedCareer}
              isLoading={isLoading}
              getSubjectsByIds={getSubjectsByIds}
            />
          )}
          {/* Call to action for contributions */}
          <div className="mt-12 pt-8 border-t border-gray-800 dark:border-gray-200">
            <div className="text-center">
              {' '}
              <h2 className="text-2xl font-bold text-white dark:text-gray-900">
                Don&apos;t see your career path?
              </h2>
              <p className="mt-3 text-lg text-gray-300 dark:text-gray-600">
                Help others by contributing your expertise!
              </p>
              <div className="mt-4">
                <button
                  onClick={() => router.push('/career-guidance/contribute')}
                  className="inline-flex items-center px-5 py-3 border border-transparent text-lg font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Contribute a New Career Path
                </button>
              </div>
            </div>
          </div>
          {/* Career List Grid Component */}
          <CareerList
            careerPathways={careerPathways}
            onSelectCareer={handleSelectCareer}
          />
        </div>
      </div>
    </>
  );
}
