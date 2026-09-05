export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-hidden="true"
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className ?? ''}`}
    />
  );
}
