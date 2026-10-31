import Link from "next/link";
import { SITE_LINKS } from "@/content/pages";
import { REPO_URL, SUPPORT_URL } from "@/lib/site";
import { ExternalLink } from "./ExternalLink";
import { Logo } from "./Logo";

const link = "transition-colors hover:text-ink";
const heading = "mb-3 font-medium text-ink";

// The repo of GitIssue itself, opened in GitIssue, so a bug in the tool is reported with the tool.
const SELF = new URL(REPO_URL).pathname;

// Links every page to the public pages, the legal pages, the source code and the support page.
export function SiteFooter() {
  return (
    <div className="mx-auto w-full max-w-6xl border-t border-line pt-10 text-left text-sm text-muted">
      <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div className="col-span-2 space-y-3 sm:col-span-1">
          <Link href="/" className="flex items-center gap-2 text-base font-medium text-ink">
            <Logo className="h-5 w-5" />
            GitIssue
          </Link>
          <p className="max-w-xs">Say the bug out loud. Get a GitHub issue that developers can fix.</p>
          <p className="max-w-xs">Nothing is posted to GitHub until you tap Post.</p>
        </div>
        <nav aria-label="Product">
          <h2 className={heading}>Product</h2>
          <ul className="space-y-2">
            {SITE_LINKS.map((l) => (
              <li key={l.href}><Link href={l.href} className={link}>{l.label}</Link></li>
            ))}
            <li><Link href="/demo" className={link}>Demo</Link></li>
          </ul>
        </nav>
        <nav aria-label="Resources">
          <h2 className={heading}>Resources</h2>
          <ul className="space-y-2">
            <li><ExternalLink href={REPO_URL} className={link}>Source code</ExternalLink></li>
            <li><Link href={SELF} className={link}>Report a GitIssue bug</Link></li>
            <li><ExternalLink href={SUPPORT_URL} className={link}>Support GitIssue</ExternalLink></li>
          </ul>
        </nav>
        <nav aria-label="Legal">
          <h2 className={heading}>Legal</h2>
          <ul className="space-y-2">
            <li><Link href="/privacy" className={link}>Privacy policy</Link></li>
            <li><Link href="/terms" className={link}>Terms of use</Link></li>
          </ul>
        </nav>
      </div>
      <p className="mt-10 border-t border-line pt-6 text-xs">© 2026 GitIssue. Open source under the MIT license.</p>
    </div>
  );
}
