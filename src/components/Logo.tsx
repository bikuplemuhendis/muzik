export function Logo({ size = 28, wordmark = true }: { size?: number; wordmark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 font-semibold tracking-tight">
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
        <rect width="32" height="32" rx="9" fill="#c8a45a" />
        <path d="M8 22c4-10 12-10 16 0" stroke="#111" strokeWidth="2.2" fill="none" />
        <circle cx="16" cy="12" r="2.4" fill="#111" />
      </svg>
      {wordmark ? <span className="text-[15px] uppercase tracking-[0.22em]">Aura</span> : null}
    </span>
  );
}

export function PlayGlyph({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M8 5.5v13l11-6.5L8 5.5z" />
    </svg>
  );
}
