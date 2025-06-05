/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ChapterList({
  chapters,
  subject,
}: {
  chapters: { id: number; name: string; form: number }[];
  subject: string;
}) {
  const [expandedChapters, setExpandedChapters] = useState<
    Record<number, boolean>
  >({});
  const [topics, setTopics] = useState<Record<number, any[]>>({});

  const toggleChapter = async (chapterId: number) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
    if (!topics[chapterId]) {
      // Fetch topics for the chapter if not already fetched
      const { data, error } = await supabase
        .from('topics')
        .select(
          'id, name, description, difficulty_level, time_estimate_minutes, order_index'
        )
        .eq('chapter_id', chapterId)
        .order('order_index', { ascending: true });

      if (error) {
        logger.error('Error fetching topics:', error);
        return;
      }

      setTopics((prev) => ({
        ...prev,
        [chapterId]: data || [],
      }));
    }
  };
  // Group chapters by form
  const groupedChapters = chapters.reduce(
    (acc, chapter) => {
      if (!acc[chapter.form]) {
        acc[chapter.form] = [];
      }
      acc[chapter.form].push(chapter);
      return acc;
    },
    {} as Record<number, { id: number; name: string; form: number }[]>
  );

  return (
    <div>
      {Object.keys(groupedChapters)
        .sort((a, b) => Number(a) - Number(b)) // Sort forms numerically
        .map((form) => (
          <div key={form} className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Form {form}</h2>
            <ol className="list-decimal pl-6">
              {groupedChapters[Number(form)].map((chapter) => (
                <li key={chapter.id} className="mb-2">
                  <div>
                    {' '}
                    <button
                      onClick={() => toggleChapter(chapter.id)}
                      className="text-left w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-md"
                    >
                      {chapter.name}
                    </button>
                    {expandedChapters[chapter.id] && (
                      <ul className="pl-4 mt-2">
                        {topics[chapter.id]?.length > 0 ? (
                          topics[chapter.id].map((topic) => (
                            <li key={topic.id} className="mb-2">
                              <Link
                                href={`/quiz/${subject}/${topic.id}`}
                                className="text-green-500 hover:underline"
                              >
                                {topic.name}
                              </Link>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {topic.description ||
                                  'No description available.'}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Difficulty: {topic.difficulty_level || 'N/A'} |
                                Time: {topic.time_estimate_minutes || 'N/A'}{' '}
                                mins
                              </p>
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-gray-500">
                            No topics available.
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ))}
    </div>
  );
}
