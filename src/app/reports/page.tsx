import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { Backdrop } from "@/components/Backdrop";
import { EmptyState } from "@/components/EmptyState";
import { ExternalLink } from "@/components/ExternalLink";
import { plural } from "@/lib/format";
import { PAGE_SIZE, pageInfo } from "@/lib/pagination";
import { pageMetadata } from "@/lib/seo";
import { getReports } from "@/lib/data";
import { getViewer } from "@/lib/github/client";

export const metadata: Metadata = pageMetadata({
  title: "My reports",
  description: "The issues you created, reopened or commented on with GitIssue.",
  path: "/reports",
  noindex: true,
});

const ACTION_TEXT = { created: "Created", commented: "Commented", reopened: "Reopened" } as const;

const pageLink = "glass inline-flex h-11 items-center rounded-full px-5 font-medium whitespace-nowrap transition-colors hover:border-white/40";

export default async function Reports({ searchParams }: PageProps<"/reports">) {
  const viewer = await getViewer();
  if (!viewer) redirect("/");
  // A page past the end shows the last page instead.
  const first = await getReports(viewer.userId, 0, PAGE_SIZE - 1);
  const { page, pages, from, to } = pageInfo((await searchParams).page, first.total);
  const { reports, total } = page === 1 ? first : await getReports(viewer.userId, from, to);

  return (
    <>
      <Backdrop />
      <AppHeader signedIn />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-xl space-y-6 px-5 pt-6 pb-16">
        <div className="space-y-2">
          <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">My reports</h1>
          {!!reports?.length && <p className="text-muted">{plural(total, "report")} from this account</p>}
        </div>
        {!reports?.length ? (
          <EmptyState
            drawing="reports"
            line="You have not reported a bug yet. Your issues and comments show here."
            action={<Link href="/#repo" className="pill h-12 px-6">Report a bug</Link>}
          />
        ) : (
          <ul className="glass divide-y divide-line overflow-hidden rounded-3xl">
            {reports.map((r) => (
              <li key={r.id}>
                <ExternalLink href={r.issue_url} className="block space-y-1 px-5 py-4 transition-colors hover:bg-white/5">
                  <p className="truncate font-medium">{r.title}</p>
                  <p className="truncate text-sm text-muted">
                    {ACTION_TEXT[r.action as keyof typeof ACTION_TEXT]} {r.repo_full_name}#{r.issue_number},{" "}
                    {new Date(r.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                  </p>
                </ExternalLink>
              </li>
            ))}
          </ul>
        )}
        {pages > 1 && (
          // Real links, so each page has its own URL and works without JavaScript.
          <nav aria-label="Pages of reports" className="flex items-center justify-between gap-3">
            {page > 1 ? <Link href={page === 2 ? "/reports" : `/reports?page=${page - 1}`} rel="prev" className={pageLink}>Newer</Link> : <span />}
            <span className="text-sm text-muted">Page {page} of {pages}</span>
            {page < pages ? <Link href={`/reports?page=${page + 1}`} rel="next" className={pageLink}>Older</Link> : <span />}
          </nav>
        )}
      </main>
    </>
  );
}
