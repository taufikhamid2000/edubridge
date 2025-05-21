'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page redirects to the unified debug console
export default function DebugRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/debug/unified');
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="animate-pulse">Redirecting to Debug Console...</div>
    </div>
  );
}
