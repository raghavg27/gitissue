const KEY = "gitissue:recent-repos";
const MAX = 6;

// Per-device convenience list (FR-5); storage can be unavailable, so every access is guarded.
export function readRecentRepos(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function rememberRepo(fullName: string) {
  try {
    const next = [fullName, ...readRecentRepos().filter((r) => r !== fullName)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
}
