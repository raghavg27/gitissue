import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { Backdrop } from "@/components/Backdrop";
import { Hero } from "@/components/Hero";
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
      <Hero
        signedIn={false}
        badge={`${owner}/${repo}`}
        title="Sign in to report a bug"
        sub="GitIssue reads this repo's templates, contributing rules and code, so your report fits the way its maintainers work."
      >
        <SignIn next={`/${owner}/${repo}`} />
      </Hero>
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
      <Backdrop />
      <AppHeader signedIn />
      <main className="mx-auto w-full max-w-xl px-5 pt-6">
        {access ? (
          <ReportFlow repo={access} devices={devices ?? []} />
        ) : (
          <div className="space-y-4 pt-4">
            <h1 className="text-3xl font-medium tracking-tight">Can&apos;t open {owner}/{repo}</h1>
            <p className="text-muted">
              Either it doesn&apos;t exist, or your GitHub account ({viewer.login}) can&apos;t see it. For an
              organization repo, check that the organization allows this app.
            </p>
            <Link href="/" className="pill h-12 px-6">Try another repo</Link>
          </div>
        )}
      </main>
    </>
  );
}
