export default function LoadingDisplay() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="text-[var(--color-subtext)]">
        <div className="animate-pulse">Loading topic data...</div>
      </div>
    </div>
  );
}
