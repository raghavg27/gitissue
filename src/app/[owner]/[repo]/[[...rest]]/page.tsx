import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { ReportFlow } from "@/components/ReportFlow";
import { SignIn } from "@/components/SignIn";
import { getViewer } from "@/lib/github/client";
import { getRepoAccess, type RepoAccess } from "@/lib/github/repo";
import { createClient } from "@/lib/supabase/server";

// Both the main report screen and the URL shortcut: /<owner>/<repo>[/anything] (§7.2).
export default async function RepoPage({ params }: PageProps<"/[owner]/[repo]/[[...rest]]">) {
  const { owner, repo } = await params;
  const viewer = await getViewer();

  if (!viewer) {
    return (
      <>
        <AppHeader signedIn={false} />
        <main className="mx-auto w-full max-w-xl space-y-6 px-4 pt-8 pb-16">
          <h1 className="font-display text-3xl font-bold">Report a bug in {owner}/{repo}</h1>
          <SignIn next={`/${owner}/${repo}`} />
        </main>
      </>
    );
  }

  let access: RepoAccess | null = null;
  try {
    access = await getRepoAccess(viewer.octokit, owner, repo);
  } catch {}

  const supabase = await createClient();
  const { data: devices } = await supabase.from("device_profiles").select("*").order("created_at");

  return (
    <>
      <AppHeader signedIn />
      <main className="mx-auto w-full max-w-xl px-4 pt-4">
        {access ? (
          <ReportFlow repo={access} devices={devices ?? []} />
        ) : (
          <div className="space-y-4 pt-4">
            <h1 className="font-display text-3xl font-bold">Can&apos;t open {owner}/{repo}</h1>
            <p className="text-muted">
              Either it doesn&apos;t exist, or your GitHub account ({viewer.login}) can&apos;t see it. For an
              organization repo, check that the organization allows this app.
            </p>
            <Link href="/" className="inline-block font-bold underline underline-offset-4">Try another repo</Link>
          </div>
        )}
      </main>
    </>
  );
}
