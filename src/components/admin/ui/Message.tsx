'use client';

interface MessageProps {
  type: 'success' | 'error';
  message: string | null;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export default function Message({
  type,
  message,
  onDismiss,
  onRetry,
}: MessageProps) {
  if (!message) return null;

  const isSuccess = type === 'success';
  const bgColor = isSuccess
    ? 'bg-green-100 dark:bg-green-900'
    : 'bg-red-100 dark:bg-red-900';
  const borderColor = isSuccess
    ? 'border-green-400 dark:border-green-700'
    : 'border-red-400 dark:border-red-700';
  const textColor = isSuccess
    ? 'text-green-700 dark:text-green-300'
    : 'text-red-700 dark:text-red-300';
  const buttonBgColor = isSuccess
    ? 'bg-green-200 hover:bg-green-300 dark:bg-green-800 dark:hover:bg-green-700 dark:text-green-200'
    : 'bg-red-200 hover:bg-red-300 dark:bg-red-800 dark:hover:bg-red-700 dark:text-red-200';
  const buttonTextColor = isSuccess ? 'text-green-800' : 'text-red-800';
  const ringColor = isSuccess ? 'ring-green-500' : 'ring-red-500';
  const actionLabel = isSuccess ? 'Dismiss' : onRetry ? 'Retry' : 'Dismiss';

  const handleAction = () => {
    if (isSuccess || !onRetry) {
      onDismiss?.();
    } else {
      onRetry();
    }
  };

  return (
    <div
      className={`mb-4 p-4 ${bgColor} border ${borderColor} ${textColor} rounded`}
    >
      <div className="flex flex-col sm:flex-row sm:justify-between">
        <div className="mb-2 sm:mb-0">
          <p className="font-bold">{isSuccess ? 'Success:' : 'Error:'}</p>
          <p>{message}</p>
        </div>
        {(onDismiss || onRetry) && (
          <button
            onClick={handleAction}
            className={`${buttonBgColor} ${buttonTextColor} font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 ${ringColor}`}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
