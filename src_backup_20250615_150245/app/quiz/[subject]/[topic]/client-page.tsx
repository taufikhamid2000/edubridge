'use client';

import { ReactNode } from 'react';
import TopicHeader from '@/components/topic/TopicHeader';
import QuizTable from '@/components/topic/QuizTable';
import ActionButtons from '@/components/topic/ActionButtons';
import ContentPlaceholder from '@/components/topic/ContentPlaceholder';
import ErrorDisplay from '@/components/topic/ErrorDisplay';
import LoadingDisplay from '@/components/topic/LoadingDisplay';
import { useTopicData } from '@/hooks/useTopicData';

// Client component that receives subject and topic as props
export default function ClientTopicPage({
  subject,
  topic,
}: {
  subject: string;
  topic: string;
}): ReactNode {
  const { loading, error, subjectData, topicData, chapterData, quizzes } =
    useTopicData(subject, topic);
  // Handle different states
  if (loading) return <LoadingDisplay />;
  if (error) return <ErrorDisplay message={error} />;

  // More detailed error handling with specific messages
  if (!subjectData) {
    return <ErrorDisplay message="Subject information not found" />;
  }

  if (!topicData) {
    return <ErrorDisplay message="Topic information not found" />;
  }
  if (!chapterData) {
    // No chapter data available
    return (
      <ErrorDisplay message="Chapter information not found for this topic" />
    );
  }

  return (
    <main className="container py-6 md:py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <TopicHeader
          subject={subjectData}
          chapter={chapterData}
          topic={topicData}
        />{' '}
        <QuizTable quizzes={quizzes} />
        <ActionButtons
          chapterData={chapterData}
          subject={subject}
          topic={topic}
        />
        <ContentPlaceholder />
      </div>
    </main>
  );
}
