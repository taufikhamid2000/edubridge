import { Suspense } from 'react';
import ClientTopicPage from './client-page';
import { notFound } from 'next/navigation';

// Define the correct type for the params
interface PageParams {
  subject: string;
  topic: string;
}

// Generate metadata for the page
export async function generateMetadata({ params }: { params: PageParams }) {
  // Await the params object and destructure the properties
  const { subject, topic } = await Promise.resolve(params);

  return {
    title: `${subject} - ${topic}`,
  };
}

// Make server component async to properly handle params
export default async function Page({ params }: { params: PageParams }) {
  // Await the params object and destructure the properties
  const { subject, topic } = await Promise.resolve(params);

  if (!subject || !topic) {
    notFound();
  }

  return (
    <Suspense
      fallback={<div className="p-8 text-center">Loading quiz data...</div>}
    >
      <ClientTopicPage subject={subject} topic={topic} />
    </Suspense>
  );
}
