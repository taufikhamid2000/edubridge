'use client';

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';

export default function TopicPage() {
  const router = useRouter();
  const { subject, topic } = router.query;
  const [loading, setLoading] = useState(true);
  interface TopicData {
    title: string;
    description: string;
  }

  const [topicData, setTopicData] = useState<TopicData | null>(null);

  useEffect(() => {
    if (!router.isReady || !subject || !topic) return;

    console.log('Router is ready:', router.isReady);
    console.log('Subject:', subject);
    console.log('Topic:', topic);

    const fetchTopicData = async () => {
      try {
        const { data, error } = await supabase
          .from('topics')
          .select('*')
          .eq('id', topic)
          .single();

        console.log('Supabase query response:', { data, error });

        if (error) throw error;
        setTopicData(data);
      } catch (err) {
        console.error('Error fetching topic data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopicData();
  }, [router.isReady, subject, topic]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!topicData) {
    return <div>Topic not found</div>;
  }

  return (
    <>
      <Header />
      <main>
        <h1>{topicData.title}</h1>
        <p>{topicData.description}</p>
      </main>
    </>
  );
}
