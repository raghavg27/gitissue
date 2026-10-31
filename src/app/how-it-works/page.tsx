import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/ContentPage";
import { Comparison, Steps } from "@/components/HowItWorks";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLd, pageMetadata, webPageLd } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

const DESCRIPTION = "Paste a repo link, say what broke, check the draft and post. How GitIssue compares with writing a GitHub issue by hand.";

export const metadata: Metadata = pageMetadata({ title: "How it works", description: DESCRIPTION, path: "/how-it-works" });

export default function HowItWorks() {
  const site = siteUrl();
  return (
    <ContentPage title="How it works" intro="Three steps from a bug you found to an issue a developer can fix.">
      <JsonLd
        data={[
          webPageLd(site, "/how-it-works", "How it works", DESCRIPTION),
          breadcrumbLd(site, [{ name: "Home", path: "/" }, { name: "How it works", path: "/how-it-works" }]),
        ]}
      />
      <Steps headingLevel="h2" />
      <section aria-labelledby="compare" className="space-y-3">
        <h2 id="compare" className="text-2xl font-medium tracking-tight">By hand or with GitIssue</h2>
        <Comparison />
      </section>
      <div className="flex flex-wrap gap-3">
        <Link href="/#repo" className="pill h-12 px-6">Report a bug</Link>
        <Link href="/features" className="glass inline-flex h-12 items-center rounded-full px-6 font-medium transition-colors hover:border-white/40">
          See all features
        </Link>
      </div>
    </ContentPage>
  );
}
