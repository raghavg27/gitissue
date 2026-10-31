"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";

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

// Marks itself as the current page, so screen readers and the styles know where the user is.
export function NavLink({ children, href, ...props }: React.ComponentProps<typeof Link>) {
  const pathname = usePathname();
  const current = typeof href === "string" && href.split("#")[0] === pathname;
  return (
    <Link href={href} aria-current={current ? "page" : undefined} {...props}>
      {children}
      <PendingHint />
    </Link>
  );
}
