// Grey blocks in the shape of the content that is loading. Screen readers hear the label once.
export function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-full bg-white/10 ${className}`} />;
}

export function SkeletonSection({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div role="status" aria-busy="true" aria-label={label} className={className}>
      <span className="sr-only">{label}</span>
      <div aria-hidden>{children}</div>
    </div>
  );
}

// The shape of a list of rows in a glass card, used by My reports and Devices.
export function SkeletonRows({ label, rows = 4 }: { label: string; rows?: number }) {
  return (
    <SkeletonSection label={label} className="glass divide-y divide-line overflow-hidden rounded-3xl">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="space-y-2 px-5 py-4">
          <SkeletonBlock className="h-4 w-3/4" />
          <SkeletonBlock className="h-3 w-1/2" />
        </div>
      ))}
    </SkeletonSection>
  );
}
