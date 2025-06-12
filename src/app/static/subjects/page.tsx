'use client';

import ChapterList from '@/components/subjects/ChapterList';
import SubjectHeader from '@/components/subjects/SubjectHeader';
import { useRouter } from 'next/navigation';

// Mock static data for the demo
const STATIC_CHAPTERS = [
  {
    id: '1',
    title: 'Chapter 1: Fundamentals',
    description: 'Master the basic concepts and foundational principles',
    quizCount: 5,
    progress: 80,
  },
  {
    id: '2',
    title: 'Chapter 2: Advanced Concepts',
    description: 'Explore complex topics and advanced applications',
    quizCount: 4,
    progress: 60,
  },
  {
    id: '3',
    title: 'Chapter 3: Practice',
    description: 'Apply your knowledge with hands-on exercises',
    quizCount: 6,
    progress: 30,
  },
];

const SUBJECT_DETAILS = {
  name: 'Demo Subject',
  description: 'This is a static demo page showing the subject layout.',
  icon: '📚',
};

export default function StaticSubjectPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <SubjectHeader subject={SUBJECT_DETAILS} isStatic={true} />
      <ChapterList
        chapters={STATIC_CHAPTERS}
        isLoading={false}
        error={null}
        onChapterClick={() => router.push('/static/subjects/topic')}
      />
      <div className="mt-8 text-center text-sm text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
        This is a static demo page. The same content is shown for demonstration
        purposes.
      </div>
    </div>
  );
}
