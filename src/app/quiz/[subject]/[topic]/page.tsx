import { Suspense, ReactNode } from 'react';
import { notFound } from 'next/navigation';
import ClientTopicPage from './client-page';
import type { Metadata } from 'next';

interface QuizParams {
  subject: string;
  topic: string;
}

interface Props {
  params: Promise<QuizParams> | QuizParams;
}

// Generate metadata for the page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    // Handle both Promise<QuizParams> and direct QuizParams format
    const resolvedParams = 'then' in params ? await params : params;
    const { subject, topic } = resolvedParams;

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
export default function Page({ params }: Props): ReactNode {
  try {
    // Extract the params safely without requiring async/await
    const subject = 'subject' in params ? params.subject : '';
    const topic = 'topic' in params ? params.topic : '';

    if (!subject || !topic) {
      return notFound();
    }

    return (
      <Suspense
        fallback={<div className="p-8 text-center">Loading quiz data...</div>}
      >
        {/* Explicitly cast the component props to fix TypeScript error */}
        <ClientTopicPage subject={subject} topic={topic} />
      </Suspense>
    );
  } catch (error) {
    console.error('Page component error:', error);
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p>We&rsquo;re having trouble loading this quiz. Please try again later.</p>
      </div>
    );
  }
}
