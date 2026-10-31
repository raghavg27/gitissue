import { siteUrl, SECURITY_URL } from "@/lib/site";

export const dynamic = "force-static";

// RFC 9116. Reports go to GitHub private vulnerability reporting; no email address is published.
export function GET() {
  const site = siteUrl();
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  const body = `Contact: ${SECURITY_URL}
Expires: ${expires}
Preferred-Languages: en
Canonical: ${site}/.well-known/security.txt
Policy: https://github.com/raghavg27/gitissue/blob/main/SECURITY.md
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" } });
}
