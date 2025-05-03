'use client';

import { useEffect, useState } from 'react';
import { getQuizQuestions } from '@/lib/quiz'; // Corrected import path
import Quiz from '@/components/Quiz'; // Corrected import path

export default function TopicQuiz() {
  const searchParams = new URLSearchParams(window.location.search);
  const subject = searchParams.get('subject');
  const topic = searchParams.get('topic');
  const [questions, setQuestions] = useState<
    { id: number; question: string; options: string[]; answer: string }[]
  >([]);

  useEffect(() => {
    if (subject && topic) {
      if (typeof subject === 'string' && typeof topic === 'string') {
        getQuizQuestions(subject, topic).then(setQuestions);
      }
    }
  }, [subject, topic]);

  return <Quiz questions={questions} />;
}
