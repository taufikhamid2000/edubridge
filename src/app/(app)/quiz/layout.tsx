'use client';

import { ReactNode } from 'react';
import { logger } from '@/lib/logger';

interface QuizLayoutProps {
  children: ReactNode;
}

export default function QuizLayout({ children }: QuizLayoutProps) {
  logger.log('📐 APP ROUTER - QuizLayout rendered');

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </div>
    </div>
  );
}
