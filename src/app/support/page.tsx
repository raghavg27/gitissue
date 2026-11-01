import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";
import { ExternalLink } from "@/components/ExternalLink";
import { JsonLd } from "@/components/JsonLd";
import { UPGRADES } from "@/content/support";
import { breadcrumbLd, pageMetadata, webPageLd } from "@/lib/seo";
import { siteUrl, SPONSORS_URL, SUPPORT_URL } from "@/lib/site";

const DESCRIPTION = "GitIssue runs on the free plan of each service it uses. See each limit, and what your support changes.";

export const metadata: Metadata = pageMetadata({ title: "Support GitIssue", description: DESCRIPTION, path: "/support" });

export default function Support() {
  const site = siteUrl();
  return (
    <ContentPage
      title="Support GitIssue"
      intro="GitIssue runs on the free plan of each service that it uses. Your support moves it to paid plans, so it is faster and more reliable for you and your testers."
    >
      <JsonLd
        data={[
          webPageLd(site, "/support", "Support GitIssue", DESCRIPTION),
          breadcrumbLd(site, [{ name: "Home", path: "/" }, { name: "Support GitIssue", path: "/support" }]),
        ]}
      />
      <div className="space-y-4">
        <p>
          I built GitIssue alone so that maintainers get bug reports that they can fix. To keep it free for every repo, it runs on free plans. They work, but
          each one has limits, and you can feel some of them when many testers report at the same time.
        </p>
        <p className="text-muted">Below is each limit, and what changes when it moves to a paid plan. The list is in order: the first items fix what testers notice most.</p>
        <div className="flex flex-wrap gap-3">
          <ExternalLink href={SUPPORT_URL} className="pill h-12 px-6">Buy me a coffee</ExternalLink>
          <ExternalLink href={SPONSORS_URL} className="glass inline-flex h-12 items-center rounded-full px-6 font-medium transition-colors hover:border-white/40">Sponsor on GitHub</ExternalLink>
        </div>
      </div>
      <ol className="space-y-3">
        {UPGRADES.map((u, i) => (
          <li key={u.name} className="glass space-y-2 rounded-3xl p-5">
            <h2 className="flex items-baseline gap-3 text-lg font-medium">
              <span className="text-pill tabular-nums" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              {u.name}
            </h2>
            <p className="text-muted">
              <span className="font-medium text-ink">Now: </span>
              {u.now}
            </p>
            <p>
              <span className="font-medium text-pill">With your support: </span>
              {u.next}
            </p>
          </li>
        ))}
      </ol>
      <div className="glass space-y-4 rounded-3xl p-6">
        <h2 className="text-2xl font-medium tracking-tight">If GitIssue saves your team time, help it grow</h2>
        <p className="text-muted">
          Each coffee or sponsorship goes to the upgrades above, in that order. GitIssue is open source under the MIT license, so each upgrade helps every maintainer who uses it.
        </p>
        <div className="flex flex-wrap gap-3">
          <ExternalLink href={SUPPORT_URL} className="pill h-12 px-6">Buy me a coffee</ExternalLink>
          <ExternalLink href={SPONSORS_URL} className="glass inline-flex h-12 items-center rounded-full px-6 font-medium transition-colors hover:border-white/40">Sponsor on GitHub</ExternalLink>
        </div>
      </div>
    </ContentPage>
  );
}
