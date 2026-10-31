import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { Backdrop } from "@/components/Backdrop";
import { Hero } from "@/components/Hero";
import { ReportFlow } from "@/components/ReportFlow";
import { DraftBeforeSignIn } from "@/components/DraftBeforeSignIn";
import { getDevices } from "@/lib/data";
import { getViewer } from "@/lib/github/client";
import { loadRepoAccess } from "@/lib/github/repo";
import { pageMetadata } from "@/lib/seo";

// Repo pages are per-user tools, not content, so they are never indexed.
export async function generateMetadata({ params }: PageProps<"/[owner]/[repo]/[[...rest]]">): Promise<Metadata> {
  const { owner, repo } = await params;
  return pageMetadata({
    title: `Report a bug in ${owner}/${repo}`,
    description: `Describe a bug in ${owner}/${repo} and get an issue that fits the repo.`,
    path: `/${owner}/${repo}`,
    noindex: true,
  });
}

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

  const devices = await getDevices(viewer.userId);

  return (
    <>
      <Backdrop />
      <AppHeader signedIn />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-xl px-5 pt-6">
        <ReportFlow repo={access} devices={devices} />
      </main>
    </>
  );
}
