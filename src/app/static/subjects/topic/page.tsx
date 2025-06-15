'use client';

import { useRouter } from 'next/navigation';

const STATIC_TOPICS = [
  {
    id: '1',
    name: 'Topic 1: Introduction',
    description: 'Basic concepts and introduction to the subject',
    quizCount: 3,
    progress: 75,
  },
  {
    id: '2',
    name: 'Topic 2: Core Concepts',
    description: 'Understanding the fundamental principles',
    quizCount: 4,
    progress: 50,
  },
  {
    id: '3',
    name: 'Topic 3: Advanced Applications',
    description: 'Applying concepts to real-world scenarios',
    quizCount: 5,
    progress: 25,
  },
];

export default function StaticTopicPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => router.push('/static/subjects')}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center"
        >
          ← Back to Subject
        </button>
        <h1 className="text-3xl font-bold mt-4">Demo Topics</h1>
        <p className="text-gray-400 dark:text-gray-600 mt-2">
          Browse through available topics
        </p>
      </div>

      <div className="grid gap-6">
        {STATIC_TOPICS.map((topic) => (
          <div
            key={topic.id}
            onClick={() => router.push('/static/subjects/topic/quiz')}
            className="bg-gray-800 dark:bg-white p-6 rounded-lg shadow-sm border border-gray-700 dark:border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
          >
            <h3 className="text-xl font-semibold mb-2">{topic.name}</h3>
            <p className="text-gray-400 dark:text-gray-600 mb-4">
              {topic.description}
            </p>
            <div className="flex items-center justify-between text-sm text-gray-400 dark:text-gray-500">
              <span>{topic.quizCount} quizzes</span>
              <span>{topic.progress}% complete</span>
            </div>
            <div className="mt-2 w-full bg-gray-700 dark:bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${topic.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center text-sm text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
        This is a static demo page. The same content is shown for demonstration
        purposes.
      </div>
    </div>
  );
}
