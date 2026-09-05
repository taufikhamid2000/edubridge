export function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <circle cx="16" cy="16" r="15" fill="#1e90ff" />
      <path
        d="M9 21.5V10.5L16 8l7 2.5v11L16 24l-7-2.5Z"
        fill="none"
        stroke="#f1f5f9"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 10.5 16 13l7-2.5" stroke="#f1f5f9" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
      <path d="M16 13v11" stroke="#f1f5f9" strokeWidth="1.6" />
    </svg>
  );
}
