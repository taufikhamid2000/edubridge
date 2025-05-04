// This file has been deprecated in favor of the App Router implementation
// at src/app/quiz/[subject]/[topic]/page.tsx

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LegacyTopicPage() {
  const router = useRouter();
  const { subject, topic } = router.query;

  useEffect(() => {
    if (router.isReady && subject && topic) {
      // Redirect to the App Router version
      window.location.href = `/quiz/${subject}/${topic}`;
    }
  }, [router.isReady, subject, topic]);

  return <div className="p-8 text-center">Redirecting to updated page...</div>;
}
