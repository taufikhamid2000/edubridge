import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Topic {
  id: string;
  title: string;
  description: string | null;
  difficulty_level: number | null;
  time_estimate_minutes: number | null;
  order_index: number;
}

interface Chapter {
  id: string;
  form: number;
  title: string;
  order_index: number;
  topics: Topic[];
}

interface Subject {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export default function Chapters() {
  const router = useRouter();
  const { subject } = router.query;
  const [loading, setLoading] = useState(true);
  const [subjectData, setSubjectData] = useState<Subject | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!subject) return;

      try {
        // Fetch subject data
        const { data: subjectData, error: subjectError } = await supabase
          .from('subjects')
          .select('*')
          .eq('slug', subject)
          .single();

        if (subjectError) throw subjectError;
        setSubjectData(subjectData);

        // Fetch chapters for this subject
        const { data: chaptersData, error: chaptersError } = await supabase
          .from('chapters')
          .select('*')
          .eq('subject_id', subjectData.id)
          .order('form', { ascending: true })
          .order('order_index', { ascending: true });

        if (chaptersError) throw chaptersError;

        // Fetch topics for each chapter
        const chaptersWithTopics = await Promise.all(
          (chaptersData || []).map(async (chapter) => {
            const { data: topicsData, error: topicsError } = await supabase
              .from('topics')
              .select('*')
              .eq('chapter_id', chapter.id)
              .order('order_index', { ascending: true });

            if (topicsError) throw topicsError;

            return {
              ...chapter,
              topics: topicsData || [],
            };
          })
        );

        setChapters(chaptersWithTopics);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [subject]);

  const form4Chapters = chapters.filter((chapter) => chapter.form === 4);
  const form5Chapters = chapters.filter((chapter) => chapter.form === 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-[var(--color-subtext)]">Loading chapters...</div>
      </div>
    );
  }

  if (!subjectData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-[var(--color-subtext)]">Subject not found</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{subjectData.name} · Chapter</title>
      </Head>
      <Header />
      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">{subjectData.name}</h1>

          {/* Form 4 Chapters */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Form 4</h2>
            {form4Chapters.map((chapter) => (
              <div key={chapter.id} className="mb-6">
                <h3 className="text-lg font-medium mb-2">
                  Bab {chapter.order_index}: {chapter.title}
                </h3>
                <div className="space-y-0.5">
                  {chapter.topics.map((topic) => (
                    <Link key={topic.id} href={`/quiz/${subject}/${topic.id}`}>
                      <div>
                        <span>{topic.title}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Form 5 Chapters */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Form 5</h2>
            {form5Chapters.map((chapter) => (
              <div key={chapter.id} className="mb-6">
                <h3 className="text-lg font-medium mb-2">
                  Bab {chapter.order_index}: {chapter.title}
                </h3>
                <div className="space-y-0.5">
                  {chapter.topics.map((topic) => (
                    <Link
                      key={topic.id}
                      href={`/quiz/${subject}/${topic.id}`}
                      className="flex items-center justify-between py-1.5 px-2 table-row-hover rounded-transition"
                    >
                      <div>
                        <span className="text-sm text-[var(--color-text)]">
                          {topic.title}
                        </span>
                        {topic.description && (
                          <span className="text-xs text-[var(--color-subtext)] ml-2">
                            ({topic.description})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {topic.difficulty_level && (
                          <span className="text-[var(--color-subtext)]">
                            {Array(topic.difficulty_level).fill('⭐').join('')}
                          </span>
                        )}
                        {topic.time_estimate_minutes && (
                          <span className="text-[var(--color-subtext)]">
                            {topic.time_estimate_minutes} min
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
