"use client";

import Link, { useLinkStatus } from "next/link";

// A fixed-size dot that fades in while the next page is slow to load, so the layout does not move.
function PendingHint() {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      className={`ml-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-current align-middle transition-opacity duration-150 ${
        pending ? "animate-pulse opacity-100" : "opacity-0"
      }`}
    />
  );
}

export function NavLink({ children, ...props }: React.ComponentProps<typeof Link>) {
  return (
    <Link {...props}>
      {children}
      <PendingHint />
    </Link>
  );
}
