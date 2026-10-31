import { ProblemPage } from "@/components/ProblemPage";

// Shown when a repo does not exist or the signed-in GitHub account cannot see it.
export default function RepoNotFound() {
  return (
    <ProblemPage
      title="Repo not found"
      line="This repo does not exist, or your GitHub account cannot see it. For an organization repo, check that the organization allows GitIssue."
    />
  );
}
