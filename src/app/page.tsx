'use client';

import Head from 'next/head';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>EduBridge</title>
      </Head>
      <div className="container py-8">
        <h1 className="text-3xl font-bold">Welcome to EduBridge</h1>
        <p className="mt-4">
          Your platform for educational resources and quizzes.
        </p>
        <button
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => router.push('/dashboard')}
        >
          Go to Dashboard
        </button>
      </div>
    </>
  );
}
