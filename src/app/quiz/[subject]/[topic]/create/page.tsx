'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { createQuiz } from '@/services/quizService';
import { QuizForm } from '@/components/QuizForm';

interface QuizData {
  name: string;
  subject: string;
  topic: string;
}

export default function CreateQuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subject = searchParams?.get('subject') || '';
  const topic = searchParams?.get('topic') || '';
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QuizData>();

  const mutation = useMutation({
    mutationFn: (data: QuizData) => createQuiz(data),
    onSuccess: () => {
      router.push(`/quiz/${subject}/${topic}`);
    },
  });

  const onSubmit = (data: QuizData) => {
    mutation.mutate({
      ...data,
      subject: subject as string,
      topic: topic as string,
    });
  };

  return (
    <div>
      <h1>Create Quiz</h1>
      <QuizForm
        register={register}
        handleSubmit={handleSubmit}
        errors={errors}
        onSubmit={onSubmit}
      />
    </div>
  );
}
