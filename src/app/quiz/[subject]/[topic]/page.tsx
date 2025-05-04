import { Suspense, ReactNode } from 'react';
import { notFound } from 'next/navigation';
import ClientTopicPage from './client-page';
import type { Metadata } from 'next';

interface QuizParams {
  subject: string;
  topic: string;
}

// Update the Props interface to align with PageProps constraint
interface Props {
  params: Promise<QuizParams>; // Only Promise<QuizParams> is acceptable
}

// Generate metadata for the page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    // Always await the params as they are always a Promise in Next.js 15.1.6
    const { subject, topic } = await params;

    return {
      title: `${subject} - ${topic} | EduBridge Quiz`,
      description: `Learn about ${subject} with our interactive quizzes on ${topic}`,
    };
  } catch (error) {
    console.error('Metadata generation error:', error);
    return {
      title: 'Quiz | EduBridge',
      description: 'Interactive learning quizzes',
    };
  }
}

// Dynamic route component with proper return type for React elements
export default async function Page({ params }: Props): Promise<ReactNode> {
  try {
    // Always await the params since they are always a Promise in Next.js 15.1.6
    const { subject, topic } = await params;

    if (!subject || !topic) {
      return notFound();
    }

    return (
      <Suspense
        fallback={<div className="p-8 text-center">Loading quiz data...</div>}
      >
        <ClientTopicPage subject={subject} topic={topic} />
      </Suspense>
    );
  } catch (error) {
    console.error('Page component error:', error);
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p>
          We&rsquo;re having trouble loading this quiz. Please try again later.
        </p>
      </div>
    );
  }
}
