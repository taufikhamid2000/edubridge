'use client';

interface Chapter {
  id: string;
  title: string;
  description: string;
  quizCount: number;
  progress?: number;
}

interface ChapterListProps {
  chapters: Chapter[];
  isLoading: boolean;
  error: string | null;
  onChapterClick: (chapterId: string) => void;
}

export default function ChapterList({
  chapters,
  isLoading,
  error,
  onChapterClick,
}: ChapterListProps) {
  if (isLoading) {
    return <div>Loading chapters...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {chapters.map((chapter) => (
        <div
          key={chapter.id}
          onClick={() => onChapterClick(chapter.id)}
          className="bg-gray-800 dark:bg-white p-6 rounded-lg shadow-sm border border-gray-700 dark:border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
        >
          <h3 className="text-xl font-semibold mb-2">{chapter.title}</h3>
          <p className="text-gray-400 dark:text-gray-600 mb-4">
            {chapter.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400 dark:text-gray-500">
              {chapter.quizCount} quizzes
            </span>
            {chapter.progress !== undefined && (
              <div className="flex items-center">
                <div className="w-32 h-2 bg-gray-700 dark:bg-gray-200 rounded-full mr-2">
                  <div
                    className="h-2 bg-green-500 rounded-full"
                    style={{ width: `${chapter.progress}%` }}
                  />
                </div>
                <span className="text-sm text-gray-400 dark:text-gray-500">
                  {chapter.progress}%
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
