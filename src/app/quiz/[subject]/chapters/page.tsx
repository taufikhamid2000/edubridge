'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getChaptersBySubjectSlug, getSubjectBySlug } from '@/lib/api';
import ChapterList from '@/components/ChapterList';

export default function ChaptersPage() {
  const params = useParams();
  const subject = params?.subject;

  const [chapters, setChapters] = useState<
    { id: number; title: string; form: number }[]
  >([]);
  const [subjectData, setSubjectData] = useState<{
    id: number;
    name: string;
    slug: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const subjectString = Array.isArray(subject) ? subject[0] : subject || '';

  useEffect(() => {
    if (!subject) {
      setChapters([]);
      setError('No subject specified. Please provide a valid subject.');
      return;
    }

    // Fetch subject data
    getSubjectBySlug(subjectString)
      .then((data) => {
        setSubjectData(data);

        // Fetch chapters after getting subject data
        return getChaptersBySubjectSlug(subjectString);
      })
      .then((data) => {
        setChapters(
          data.map((chapter) => ({
            ...chapter,
            form: chapter.form !== undefined ? chapter.form : 0,
          }))
        );
        setError(null);
      })
      .catch(() => {
        setError('Failed to load data. Please try again later.');
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
      {' '}
      <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-6 px-4 rounded-lg shadow-md mb-8">
        <h1 className="text-3xl font-bold">
          Chapters for {subjectData?.name || subjectString}
        </h1>
        <p className="text-lg mt-2">
          Explore the chapters available for this subject or you can practice
          using ChatGPT.
        </p>
        <button
          className="mt-4 inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow-sm transition duration-150 ease-in-out"
          onClick={() => {
            const quizPrompt = `Generate a quiz for the subject '${subjectData?.name || subject}' based on the KSSM syllabus.`;
            const chatGPTUrl = `https://chat.openai.com/?prompt=${encodeURIComponent(quizPrompt)}`;
            window.open(chatGPTUrl, '_blank');
          }}
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.5093-2.6067-1.4997z" />
          </svg>
          Practice quiz with ChatGPT
        </button>{' '}
      </header>{' '}
      {chapters.length === 0 ? (
        <div className="text-center py-10 px-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>{' '}
          <p className="text-gray-700 dark:text-gray-300">
            No chapters available for this subject. Please check back later.
          </p>
        </div>
      ) : (
        <ChapterList chapters={chapters} subject={subjectString} />
      )}
    </div>
  );
}
