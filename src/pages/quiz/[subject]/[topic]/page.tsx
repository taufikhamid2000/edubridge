'use client';

import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function TopicQuiz() {
  const router = useRouter();
  const { subject, topic } = router.query;

  console.log(
    '🔵 PAGES ROUTER - Component rendering with query:',
    router.query
  );
  console.log(`📑 PAGES ROUTER - Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 PAGES ROUTER - Route handler for: /quiz/${subject}/${topic}`);

  useEffect(() => {
    console.log('🔵 PAGES ROUTER - useEffect triggered');
    console.log('Router is ready:', router.isReady);
    console.log('Subject from query:', subject);
    console.log('Topic from query:', topic);

    if (router.isReady && subject && topic) {
      console.log('🔄 Redirecting to App Router version...');
      // Redirect to the App Router version
      window.location.href = `/quiz/${subject}/${topic}`;
    }
  }, [router.isReady, subject, topic]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      Redirecting...
    </div>
  );
}
