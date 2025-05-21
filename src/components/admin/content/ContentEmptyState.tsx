'use client';

interface EmptyStateProps {
  message: string;
}

export default function ContentEmptyState({ message }: EmptyStateProps) {
  return (
    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
      {message}
    </div>
  );
}
