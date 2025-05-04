import { Suspense } from 'react';
import ClientTopicPage from './client-page';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface QuizParams {
  subject: string;
  topic: string;
}

// Create our own Props interface instead of using PageProps
interface Props {
  params: Promise<QuizParams>;
}

// Generate metadata for the page using our Props interface
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // params is typed as Promise<QuizParams>
  const { subject, topic } = await params;

  return {
    title: `${subject} - ${topic}`,
  };
}

// Make server component async to properly handle params
export default async function Page({ params }: Props) {
  // Directly await the params which is now correctly typed as a Promise
  const { subject, topic } = await params;

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
