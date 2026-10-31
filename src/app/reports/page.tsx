import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { Backdrop } from "@/components/Backdrop";
import { EmptyState } from "@/components/EmptyState";
import { getViewer } from "@/lib/github/client";
import { createClient } from "@/lib/supabase/server";

const ACTION_TEXT = { created: "Created", commented: "Commented", reopened: "Reopened" } as const;

export default async function Reports() {
  if (!(await getViewer())) redirect("/");
  const supabase = await createClient();
  const { data: reports } = await supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(100);

  return (
    <>
      <Backdrop />
      <AppHeader signedIn />
      <main className="mx-auto w-full max-w-xl space-y-6 px-5 pt-6 pb-16">
        <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">My reports</h1>
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
                <a href={r.issue_url} target="_blank" rel="noreferrer" className="block space-y-1 px-5 py-4 transition-colors hover:bg-white/5">
                  <p className="font-medium">{r.title}</p>
                  <p className="text-sm text-muted">
                    {ACTION_TEXT[r.action as keyof typeof ACTION_TEXT]} {r.repo_full_name}#{r.issue_number},{" "}
                    {new Date(r.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
