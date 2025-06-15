'use client';

import { useRouter } from 'next/navigation';

const STATIC_QUIZ = {
  title: 'Sample Quiz',
  description: 'Test your knowledge with this demonstration quiz',
  questions: [
    {
      id: '1',
      text: 'What is the main purpose of this quiz?',
      options: [
        { id: 'A', text: 'To demonstrate the quiz interface' },
        { id: 'B', text: 'To test advanced concepts' },
        { id: 'C', text: 'To evaluate performance' },
        { id: 'D', text: 'To grade students' },
      ],
    },
    {
      id: '2',
      text: 'Which of the following is a static page feature?',
      options: [
        { id: 'A', text: 'Real-time updates' },
        { id: 'B', text: 'Database connections' },
        { id: 'C', text: 'Offline availability' },
        { id: 'D', text: 'User authentication' },
      ],
    },
  ],
};

export default function StaticQuizPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <button
          onClick={() => router.push('/static/subjects/topic')}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center"
        >
          ← Back to Topics
        </button>
      </div>

      <div className="bg-gray-800 dark:bg-white rounded-lg shadow-sm border border-gray-700 dark:border-gray-200 p-6">
        <h1 className="text-3xl font-bold mb-4">{STATIC_QUIZ.title}</h1>
        <p className="text-gray-400 dark:text-gray-600 mb-8">
          {STATIC_QUIZ.description}
        </p>

        <div className="space-y-8">
          {STATIC_QUIZ.questions.map((question) => (
            <div
              key={question.id}
              className="border-b border-gray-700 dark:border-gray-200 pb-6 last:border-0"
            >
              <p className="font-medium mb-4">
                {question.id}. {question.text}
              </p>
              <div className="space-y-2">
                {question.options.map((option) => (
                  <div
                    key={option.id}
                    className="p-3 rounded-lg border border-gray-700 dark:border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <span className="font-medium mr-2">{option.id}.</span>
                    {option.text}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
        This is a static demo quiz. The same content is shown for demonstration
        purposes.
      </div>
    </div>
  );
}
