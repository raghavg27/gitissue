export type RepoRef = { owner: string; repo: string };

const OWNER = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const REPO = /^[A-Za-z0-9._-]{1,100}$/;

// Accepts github.com URLs (with extra path segments, .git, #hash), SSH remotes and bare "owner/repo".
export function parseRepoUrl(input: string): RepoRef | null {
  let s = input.trim().replace(/[#?].*$/, "");
  const ssh = s.match(/^git@github\.com:(.+)$/i);
  if (ssh) {
    s = ssh[1];
  } else if (/^(https?:\/\/)?(www\.)?github\.com\//i.test(s)) {
    s = s.replace(/^(https?:\/\/)?(www\.)?github\.com\//i, "");
  } else if (/^[a-z]+:\/\//i.test(s) || /^[^/]+\.[a-z]{2,}\//i.test(s)) {
    return null;
  }
  const [owner, rawRepo] = s.split("/");
  if (!owner || !rawRepo) return null;
  const repo = rawRepo.replace(/\.git$/i, "");
  if (!OWNER.test(owner) || !REPO.test(repo)) return null;
  return { owner, repo };
}
