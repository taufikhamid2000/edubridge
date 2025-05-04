import { Suspense } from 'react';
import ClientTopicPage from './client-page';

// Use a regular function component instead of async
export default function TopicPage({
  params,
}: {
  params: { subject: string; topic: string };
}) {
  // Access params directly as they are properly typed now
  const { subject, topic } = params;

  return (
    <Suspense
      fallback={<div className="p-8 text-center">Loading quiz data...</div>}
    >
      <ClientTopicPage subject={subject} topic={topic} />
    </Suspense>
  );
}
