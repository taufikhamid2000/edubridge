import { Suspense } from 'react';
import ClientTopicPage from './client-page';

// The root component is now a Server Component which can use the params directly
export default function TopicPage({
  params,
}: {
  params: { subject: string; topic: string };
}) {
  // Server components can directly access params without `use()`
  const { subject, topic } = params;

  return (
    <Suspense
      fallback={<div className="p-8 text-center">Loading quiz data...</div>}
    >
      <ClientTopicPage subject={subject} topic={topic} />
    </Suspense>
  );
}
