import { NavLink } from "./NavLink";

const item =
  "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-xs text-muted transition-colors aria-[current=page]:text-ink";
const icon = "h-6 w-6";

// Phones only: the main navigation sits at the bottom, in thumb reach, above the home indicator.
export function BottomNav() {
  return (
    <nav
      id="bottom-nav"
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/80 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl sm:hidden"
    >
      <div className="mx-auto flex h-[3.75rem] max-w-xl items-center">
        <NavLink href="/#repo" className={item}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden className={icon}>
            <path d="M12 5v14M5 12h14" />
          </svg>
          Report a bug
        </NavLink>
        <NavLink href="/reports" className={item}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden className={icon}>
            <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
          </svg>
          My reports
        </NavLink>
        <NavLink href="/devices" className={item}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden className={icon}>
            <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
            <path d="M11 18.5h2" />
          </svg>
          Devices
        </NavLink>
      </div>
    </nav>
  );
}
