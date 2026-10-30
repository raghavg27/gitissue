import type { Octokit } from "@octokit/rest";

export type RepoAccess = {
  owner: string;
  repo: string;
  fullName: string;
  private: boolean;
  defaultBranch: string;
  canTriage: boolean;
};

// Throws (404) when the repo doesn't exist or the viewer can't see it (FR-4).
export async function getRepoAccess(octokit: Octokit, owner: string, repo: string): Promise<RepoAccess> {
  const { data } = await octokit.repos.get({ owner, repo });
  return {
    owner: data.owner.login,
    repo: data.name,
    fullName: data.full_name,
    private: data.private,
    defaultBranch: data.default_branch,
    canTriage: data.permissions?.triage === true || data.permissions?.push === true,
  };
}

export async function getFileText(octokit: Octokit, access: RepoAccess, path: string): Promise<string> {
  const { data } = await octokit.repos.getContent({
    owner: access.owner,
    repo: access.repo,
    path,
    ref: access.defaultBranch,
    mediaType: { format: "raw" },
  });
  return data as unknown as string;
}
