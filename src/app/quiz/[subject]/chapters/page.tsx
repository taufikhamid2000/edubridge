'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getChaptersBySubjectSlug } from '@/lib/api';
import ChapterList from '@/components/ChapterList';

export default function ChaptersPage() {
  console.log('ChaptersPage component loaded');

  const params = useParams();
  const subject = params?.subject;

  console.log('Route parameter (subject):', subject);

  const [chapters, setChapters] = useState<
    { id: number; title: string; form: number }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  const subjectString = Array.isArray(subject) ? subject[0] : subject || '';

  useEffect(() => {
    if (!subject) {
      console.log('No subject provided in the query parameters.');
      setChapters([]);
      setError('No subject specified. Please provide a valid subject.');
      return;
    }

    console.log('Subject query parameter:', subject);
    console.log('Processed subject string:', subjectString);
    console.log('Query to be run on Supabase:', { subject: subjectString });

    getChaptersBySubjectSlug(subjectString)
      .then((data) => {
        console.log('Fetched chapters:', data);
        setChapters(
          data.map((chapter) => ({
            ...chapter,
            form: chapter.form !== undefined ? chapter.form : 0, // Default to 0 if form is missing
          }))
        );
        setError(null);
      })
      .catch((err) => {
        console.error('Error fetching chapters:', err);
        setError('Failed to load chapters. Please try again later.');
      });
  }, [subject, subjectString]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-8">
      <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-6 px-4 rounded-lg shadow-md mb-8">
        <h1 className="text-3xl font-bold">Chapters for {subject}</h1>
        <p className="text-lg mt-2">
          Explore the chapters available for this subject.
        </p>
      </header>

      {chapters.length === 0 ? (
        <div className="text-center text-gray-700 dark:text-gray-300">
          <p>
            No chapters available for this subject. Please check back later.
          </p>
        </div>
      ) : (
        <ChapterList chapters={chapters} subject={subjectString} />
      )}
    </div>
  );
}
