import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { getViewer } from "@/lib/github/client";
import { createClient } from "@/lib/supabase/server";

const ACTION_TEXT = { created: "Created", commented: "Commented", reopened: "Reopened" } as const;

export default async function Reports() {
  if (!(await getViewer())) redirect("/");
  const supabase = await createClient();
  const { data: reports } = await supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(100);

  return (
    <>
      <AppHeader signedIn />
      <main className="mx-auto w-full max-w-xl space-y-6 px-4 pt-6 pb-16">
        <h1 className="font-display text-3xl font-bold">My reports</h1>
        {!reports?.length ? (
          <p className="text-muted">
            Nothing reported yet. <Link href="/" className="font-bold text-ink underline">Pick a repo</Link> to file your first bug.
          </p>
        ) : (
          <ul className="divide-y divide-line rounded-xl border border-line bg-card">
            {reports.map((r) => (
              <li key={r.id}>
                <a href={r.issue_url} target="_blank" rel="noreferrer" className="block space-y-1 px-4 py-3">
                  <p className="font-bold">{r.title}</p>
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
