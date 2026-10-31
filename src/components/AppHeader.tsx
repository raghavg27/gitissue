import Link from "next/link";
import { BottomNav } from "./BottomNav";
import { NavLink } from "./NavLink";
import { SignOutButton } from "./SignOutButton";

const link = "transition-colors duration-150 hover:text-ink aria-[current=page]:text-ink";

export function AppHeader({ signedIn, reveal = false }: { signedIn: boolean; reveal?: boolean }) {
  return (
    <header
      className={`relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-3 sm:px-10 sm:pt-7 ${reveal ? "reveal" : ""}`}
      style={reveal ? ({ "--delay": "150ms", "--rise": "-0.75rem" } as React.CSSProperties) : undefined}
    >
      <Link href="/" className="flex items-center gap-2.5 text-lg font-medium tracking-tight text-white sm:text-[1.375rem]">
        {/* An issue circle with a voice wave inside it. */}
        <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-6 w-6">
          <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M6.5 12c1.3 0 1.3-3 2.75-3S10.6 15 12 15s1.3-6 2.75-6S16.2 12 17.5 12"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>
        GitIssue
      </Link>
      {signedIn && (
        <>
          <nav aria-label="Main" className="glass hidden h-12 items-center gap-7 rounded-full px-7 text-[0.95rem] whitespace-nowrap text-muted sm:flex">
            <NavLink href="/reports" className={link}>My reports</NavLink>
            <NavLink href="/settings" className={link}>Devices</NavLink>
            <SignOutButton className={link} />
          </nav>
          <div className="text-sm text-muted sm:hidden">
            <SignOutButton className={link} />
          </div>
          <BottomNav />
        </>
      )}
    </header>
  );
}
