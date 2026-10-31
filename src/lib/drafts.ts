// Report drafts live on this device only, one per repo, so a refresh, a sign-in or a limit does not lose the text.
// Storage can be unavailable (private mode, blocked site data), so every access is guarded.

const key = (repo: string) => `gitissue:draft:${repo.toLowerCase()}`;

export function loadDraft<T extends object>(repo: string): Partial<T> {
  try {
    const value = JSON.parse(localStorage.getItem(key(repo)) ?? "{}");
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}

export function saveDraft(repo: string, draft: object) {
  try {
    localStorage.setItem(key(repo), JSON.stringify(draft));
  } catch {}
}

export function clearDraft(repo: string) {
  try {
    localStorage.removeItem(key(repo));
  } catch {}
}
