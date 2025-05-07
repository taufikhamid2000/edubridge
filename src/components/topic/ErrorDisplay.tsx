export interface ErrorDisplayProps {
  message: string;
}

export default function ErrorDisplay({ message }: ErrorDisplayProps) {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-4 rounded-md max-w-full">
        <h2 className="font-bold mb-2">Error</h2>
        <p>{message}</p>
      </div>
    </div>
  );
}
