import Link from "next/link";
import { SITE_LINKS } from "@/content/pages";
import { REPO_URL } from "@/lib/site";
import { BottomNav } from "./BottomNav";
import { ExternalLink } from "./ExternalLink";
import { IssueCountChip } from "./IssueCount";
import { Logo } from "./Logo";
import { NavLink } from "./NavLink";
import { SignOutButton } from "./SignOutButton";
import { SiteMenu } from "./SiteMenu";

const link = "transition-colors duration-150 hover:text-ink aria-[current=page]:text-ink";

export function AppHeader({ signedIn, reveal = false }: { signedIn: boolean; reveal?: boolean }) {
  return (
    <header
      className={`relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-5 sm:gap-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-3 sm:px-10 sm:pt-7 ${reveal ? "reveal" : ""}`}
      style={reveal ? ({ "--delay": "150ms", "--rise": "-0.75rem" } as React.CSSProperties) : undefined}
    >
      <div className="flex items-center gap-2.5 sm:gap-4">
        <Link href="/" className="flex items-center gap-2.5 text-lg font-medium tracking-tight text-white sm:text-[1.375rem]">
          <Logo />
          GitIssue
        </Link>
        <IssueCountChip />
      </div>
      {signedIn ? (
        <>
          <nav aria-label="Main" className="glass hidden h-12 items-center gap-7 rounded-full px-7 text-[0.95rem] whitespace-nowrap text-muted sm:flex">
            <NavLink href="/reports" className={link}>My reports</NavLink>
            <NavLink href="/devices" className={link}>Devices</NavLink>
            <SignOutButton className={link} />
          </nav>
          <div className="text-sm text-muted sm:hidden">
            <SignOutButton className={link} />
          </div>
          <BottomNav />
        </>
      ) : (
        <div className="flex items-center gap-2 sm:gap-3">
          <nav aria-label="Main" className="glass hidden h-12 items-center gap-7 rounded-full px-7 text-[0.95rem] whitespace-nowrap text-muted sm:flex">
            {SITE_LINKS.map((l) => (
              <NavLink key={l.href} href={l.href} className={link}>{l.label}</NavLink>
            ))}
            <ExternalLink href={REPO_URL} aria-label="Source code on GitHub" className={link}>
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-5 w-5">
                <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
              </svg>
            </ExternalLink>
          </nav>
          <Link href="/#repo" className="pill h-10 px-3 text-[0.95rem] whitespace-nowrap sm:h-12 sm:px-6">
            {/* Short on phones to make room for the issue count chip. */}
            Report<span className="sr-only sm:not-sr-only">&nbsp;a bug</span>
          </Link>
          <SiteMenu />
        </div>
      )}
    </header>
  );
}
