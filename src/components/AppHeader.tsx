import Link from "next/link";

export function AppHeader({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="mx-auto flex w-full max-w-xl items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-2">
      <Link href="/" className="font-display text-xl font-bold tracking-tight">
        GitIssue
      </Link>
      {signedIn && (
        <nav className="flex items-center gap-4 text-sm text-muted">
          <Link href="/reports" className="hover:text-ink">My reports</Link>
          <Link href="/settings" className="hover:text-ink">Devices</Link>
          <form action="/auth/signout" method="post">
            <button className="hover:text-ink">Sign out</button>
          </form>
        </nav>
      )}
    </header>
  );
}
