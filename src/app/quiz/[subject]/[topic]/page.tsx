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

    console.log('🔍 APP ROUTER - generateMetadata called:', { subject, topic });

    return {
      title: `${subject} - ${topic} | EduBridge Quiz`,
      description: `Learn about ${subject} with our interactive quizzes on ${topic}`,
    };
  } catch (error) {
    console.error('💥 METADATA ERROR (APP ROUTER):', error);
    return {
      title: 'Quiz | EduBridge',
      description: 'Interactive learning quizzes',
    };
  }
}

// Dynamic route component with proper return type for React elements
export default async function Page({ params }: Props): Promise<ReactNode> {
  console.log('🚀 APP ROUTER - Page component called with params:', params);

  try {
    // Always await the params since they are always a Promise in Next.js 15.1.6
    console.log('⏳ APP ROUTER - Awaiting params...');
    const { subject, topic } = await params;
    console.log(
      `✅ APP ROUTER - Params resolved: subject=${subject}, topic=${topic}`
    );

    // Log important information that might help diagnose the issue
    console.log(`📊 APP ROUTER - Environment: ${process.env.NODE_ENV}`);
    console.log(`📚 APP ROUTER - Route handler for: /quiz/${subject}/${topic}`);

    if (!subject || !topic) {
      console.log('❌ APP ROUTER - Missing subject or topic, returning 404');
      return notFound();
    }

    console.log('🔄 APP ROUTER - Rendering ClientTopicPage component');
    return (
      <Suspense
        fallback={<div className="p-8 text-center">Loading quiz data...</div>}
      >
        <ClientTopicPage subject={subject} topic={topic} />
      </Suspense>
    );
  } catch (error) {
    console.error('💥 PAGE COMPONENT ERROR (APP ROUTER):', error);
    // Log full error details
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    // Re-throw to see the error in production
    throw error;
  }
}
