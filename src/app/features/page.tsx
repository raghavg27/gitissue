import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/ContentPage";
import { JsonLd } from "@/components/JsonLd";
import { FEATURES } from "@/content/features";
import { breadcrumbLd, pageMetadata, webPageLd } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

const DESCRIPTION = "Each GitIssue feature and the reason for it: dictation, repo templates, real screen names, duplicate checks and more.";

export const metadata: Metadata = pageMetadata({ title: "Features", description: DESCRIPTION, path: "/features" });

export default function Features() {
  const site = siteUrl();
  return (
    <ContentPage title="Features" intro="Each thing GitIssue does, and the reason it does it.">
      <JsonLd
        data={[
          webPageLd(site, "/features", "Features", DESCRIPTION),
          breadcrumbLd(site, [{ name: "Home", path: "/" }, { name: "Features", path: "/features" }]),
        ]}
      />
      <ul className="space-y-3">
        {FEATURES.map((f) => (
          <li key={f.name} className="glass space-y-2 rounded-3xl p-5">
            <h2 className="text-lg font-medium">{f.name}</h2>
            <p>{f.what}</p>
            <p className="text-muted">
              <span className="font-medium text-ink">Why: </span>
              {f.why}
            </p>
          </li>
        ))}
      </ul>
      <p className="text-muted">
        Have a question? See the <Link href="/faq" className="text-ink underline underline-offset-4">FAQ</Link>, or read{" "}
        <Link href="/how-it-works" className="text-ink underline underline-offset-4">how it works</Link>.
      </p>
      <Link href="/#repo" className="pill h-12 px-6">Report a bug</Link>
    </ContentPage>
  );
}
