'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getChapters } from '@/lib/api';
import ChapterList from '@/components/ChapterList';

export default function ChaptersPage() {
  // Removed unused router
  const searchParams = useSearchParams();
  const subject = searchParams?.get('subject');

  const [chapters, setChapters] = useState<{ id: number; title: string }[]>([]); // Fixed type

  useEffect(() => {
    if (!subject) {
      setChapters([]);
      return;
    }

    const subjectString = Array.isArray(subject) ? subject[0] : subject; // Ensure subject is a string
    getChapters(subjectString).then(setChapters);
  }, [subject]);

  if (!subject) {
    return <div>No subject specified. Please provide a valid subject.</div>;
  }

  return <ChapterList chapters={chapters} />;
}
