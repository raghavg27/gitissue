import Link from "next/link";
import { AppHeader } from "./AppHeader";
import { Backdrop } from "./Backdrop";
import { EmptyState } from "./EmptyState";
import { SiteFooter } from "./SiteFooter";

// Shared body for error and not-found pages: what happened, one way forward, and a link to a safe page.
export function ProblemPage({ title, line, action }: { title: string; line: string; action?: React.ReactNode }) {
  return (
    <>
      <Backdrop />
      <AppHeader signedIn={false} />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-xl space-y-6 px-5 pt-6 pb-16">
        <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">{title}</h1>
        <EmptyState
          drawing="search"
          line={line}
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              {action}
              <Link href="/" className="glass inline-flex h-12 items-center rounded-full px-6 font-medium transition-colors hover:border-white/40">
                Go to the home page
              </Link>
            </div>
          }
        />
      </main>
      <footer className="px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <SiteFooter />
      </footer>
    </>
  );
}
