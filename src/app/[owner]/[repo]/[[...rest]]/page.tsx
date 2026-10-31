import { notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { Backdrop } from "@/components/Backdrop";
import { Hero } from "@/components/Hero";
import { ReportFlow } from "@/components/ReportFlow";
import { DraftBeforeSignIn } from "@/components/DraftBeforeSignIn";
import { getViewer } from "@/lib/github/client";
import { loadRepoAccess } from "@/lib/github/repo";
import { createClient } from "@/lib/supabase/server";

// Both the main report screen and the URL shortcut: /<owner>/<repo>[/anything] (§7.2).
export default async function RepoPage({ params }: PageProps<"/[owner]/[repo]/[[...rest]]">) {
  const { owner, repo } = await params;
  const viewer = await getViewer();

  if (!viewer) {
    return (
      <Hero
        signedIn={false}
        badge={`${owner}/${repo}`}
        title="Describe the bug first"
        sub="Write or say what went wrong. When you are ready, sign in with GitHub and GitIssue drafts an issue that fits this repo's templates and code."
      >
        <DraftBeforeSignIn repo={`${owner}/${repo}`} />
      </Hero>
    );
  }

  const access = await loadRepoAccess(viewer.octokit, owner, repo).catch(() => null);
  if (!access) notFound();

  const supabase = await createClient();
  const { data: devices } = await supabase.from("device_profiles").select("*").order("created_at");

  return (
    <>
      <Backdrop />
      <AppHeader signedIn />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-xl px-5 pt-6">
        <ReportFlow repo={access} devices={devices ?? []} />
      </main>
    </>
  );
}
