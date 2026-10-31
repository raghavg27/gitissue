// Public, indexable pages. The sitemap, the footer and llms.txt read from this list.
export const PUBLIC_PAGES = [
  { path: "/", name: "Home", description: "Say the bug out loud and get a GitHub issue that fits the repo.", updated: "2026-10-31" },
  { path: "/features", name: "Features", description: "Each GitIssue feature and the reason for it.", updated: "2026-10-31" },
  { path: "/privacy", name: "Privacy policy", description: "What data GitIssue keeps, and each outside service that receives it.", updated: "2026-10-31" },
  { path: "/terms", name: "Terms of use", description: "The rules for using GitIssue.", updated: "2026-10-31" },
] as const;

// Paths that crawlers must not visit: API routes, auth steps and signed-in pages.
export const PRIVATE_PATHS = ["/api/", "/auth/", "/open", "/reports", "/devices", "/settings"];

// The product pages in the top navigation and the footer.
export const SITE_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/faq", label: "FAQ" },
] as const;
