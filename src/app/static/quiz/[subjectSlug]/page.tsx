import { Suspense, ReactNode } from 'react';
import React from 'react';
import type { Metadata } from 'next';
import { logger } from '@/lib/logger';
import StaticQuizPage from './client-page';

interface SubjectParams {
  subjectSlug: string;
}

interface Props {
  params: Promise<SubjectParams>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    // Use await since generateMetadata is an async function
    const { subjectSlug } = await params;
    return {
      title: `${subjectSlug} Quizzes | EduBridge`,
      description: `Learn about ${subjectSlug} with our interactive quizzes`,
    };
  } catch (error) {
    logger.error('💥 METADATA ERROR (STATIC APP ROUTER):', error);
    return {
      title: 'Quiz | EduBridge',
      description: 'Interactive learning quizzes',
    };
  }
}

export default async function Page({ params }: Props): Promise<ReactNode> {
  try {
    return (
      <Suspense
        fallback={<div className="p-8 text-center">Loading quiz data...</div>}
      >
        <StaticQuizPage params={params} />
      </Suspense>
    );
  } catch (error) {
    logger.error('💥 PAGE COMPONENT ERROR (STATIC APP ROUTER):', error);
    if (error instanceof Error) {
      logger.error('Error name:', error.name);
      logger.error('Error message:', error.message);
      logger.error('Error stack:', error.stack);
    }
    throw error;
  }
}
