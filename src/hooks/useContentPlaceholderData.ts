import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { useTopicData } from './useTopicData';

export function useContentPlaceholderData() {
  const params = useParams();
  const subject = params?.subject as string;
  const topic = params?.topic as string;

  const { subjectData, topicData, chapterData, loading, error } = useTopicData(
    subject,
    topic
  );

  const quizPrompt = useMemo(() => {
    if (subjectData && chapterData && topicData) {
      return `Generate a quiz for the subject '${subjectData.name}', tingkatan '${chapterData.form}', chapter '${chapterData.title}', and topic '${topicData.title}' based on the KSSM syllabus.`;
    }
    return '';
  }, [subjectData, chapterData, topicData]);

  return {
    quizPrompt,
    loading,
    error,
    hasData: Boolean(subjectData && topicData && chapterData),
  };
}
