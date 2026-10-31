// The public address of the app, from trusted configuration only (never from request headers).
// In development it is always this machine, so a local sign-in comes back here and not to the live site.
export function siteUrl(): string {
  if (process.env.NODE_ENV === "development") return `http://localhost:${process.env.PORT || 3000}`;
  if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  // The origin is lowercase with no trailing slash, so it matches Supabase's list of allowed redirect URLs.
  return new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").origin;
}

// A return path after sign-in must stay on this site: one leading slash, no backslash, no control characters.
export function safeNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  if (/[\\\u0000-\u001f]/.test(value) || /%(0[0-9a-f]|1[0-9a-f]|5c)/i.test(value)) return "/";
  return value;
}

export const BRAND = "GitIssue";
// Cookie with a random ID per browser, used only as a hash for per-device rate limits.
export const DEVICE_COOKIE = "gi_device";
export const REPO_URL = "https://github.com/raghavg27/gitissue";
export const SUPPORT_URL = "https://buymeacoffee.com/raghavg27";
export const SECURITY_URL = `${REPO_URL}/security/advisories/new`;
