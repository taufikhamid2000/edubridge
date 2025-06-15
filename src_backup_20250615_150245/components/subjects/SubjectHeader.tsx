'use client';

interface Subject {
  name: string;
  description: string;
  icon: string;
}

interface SubjectHeaderProps {
  subject: Subject;
  isStatic?: boolean;
}

export default function SubjectHeader({
  subject,
  isStatic,
}: SubjectHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-4xl">{subject.icon}</span>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {subject.name}
          {isStatic && (
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              (Static Version)
            </span>
          )}
        </h1>
      </div>
      <p className="text-gray-600 dark:text-gray-400">{subject.description}</p>
    </div>
  );
}
