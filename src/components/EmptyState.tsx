// Line drawings for empty lists. Decorative, so screen readers skip them.
const drawings = {
  reports: (
    <>
      <rect x="22" y="14" width="76" height="92" rx="12" />
      <circle cx="44" cy="42" r="9" />
      <path d="M62 38h22M62 46h14M36 66h48M36 78h36" />
      <path d="M76 96l8 8 16-18" strokeWidth="3" className="text-ok" stroke="currentColor" />
    </>
  ),
  devices: (
    <>
      <rect x="34" y="10" width="52" height="100" rx="12" />
      <path d="M52 20h16" />
      <circle cx="60" cy="96" r="4" />
      <path d="M46 48c4-6 24-6 28 0M50 58c3-3 17-3 20 0" opacity="0.6" />
    </>
  ),
  search: (
    <>
      <circle cx="52" cy="52" r="30" />
      <path d="M74 74l26 26" strokeWidth="3" />
      <path d="M42 46c2-6 8-9 14-8" opacity="0.6" />
    </>
  ),
};

export function EmptyState({
  drawing,
  line,
  action,
}: {
  drawing: keyof typeof drawings;
  line: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="glass flex flex-col items-center gap-4 rounded-3xl px-6 py-10 text-center">
      <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-24 w-24 text-muted">
        {drawings[drawing]}
      </svg>
      <p className="max-w-xs text-muted">{line}</p>
      {action}
    </div>
  );
}
