import { notFound } from "next/navigation";
import { getViewer } from "@/lib/github/client";
import { loadRepoAccess } from "@/lib/github/repo";
import { parseRepoUrl } from "@/lib/repo-url";

// Checks the repo here, before the page's loading skeleton starts the stream, so a missing repo returns a real 404.
export default async function RepoLayout({ children, params }: LayoutProps<"/[owner]/[repo]">) {
  const { owner, repo } = await params;
  if (!parseRepoUrl(`${owner}/${repo}`)) notFound();
  const viewer = await getViewer();
  if (viewer && !(await loadRepoAccess(viewer.octokit, owner, repo).catch(() => null))) notFound();
  return children;
}
