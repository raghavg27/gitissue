import Link from "next/link";
import { REPO_URL, SUPPORT_URL } from "@/lib/site";
import { ExternalLink } from "./ExternalLink";

const link = "transition-colors hover:text-ink";

// Links every page to the related public pages, the source code and the support page.
export function SiteFooter() {
  return (
    <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted">
      <Link href="/features" className={link}>Features</Link>
      <ExternalLink href={REPO_URL} className={link}>Source code</ExternalLink>
      <ExternalLink href={SUPPORT_URL} className={link}>Support GitIssue</ExternalLink>
    </nav>
  );
}
