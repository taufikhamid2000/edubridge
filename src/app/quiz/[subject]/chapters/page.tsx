import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getChapters } from '@/lib/api';
import ChapterList from '@/components/ChapterList';

export default function ChaptersPage() {
  const router = useRouter();
  const { subject } = router.query;
  const [chapters, setChapters] = useState<{ id: number; title: string }[]>([]); // Fixed type

  useEffect(() => {
    if (subject) {
      const subjectString = Array.isArray(subject) ? subject[0] : subject; // Ensure subject is a string
      getChapters(subjectString).then(setChapters);
    }
  }, [subject]);

  return <ChapterList chapters={chapters} />;
}
