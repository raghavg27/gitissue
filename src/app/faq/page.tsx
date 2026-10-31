import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/ContentPage";
import { FaqList } from "@/components/FaqList";
import { JsonLd } from "@/components/JsonLd";
import { FAQ } from "@/content/features";
import { breadcrumbLd, faqLd, pageMetadata, webPageLd } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

const DESCRIPTION = "Answers about GitIssue: what it posts, which AI it uses, private repos, the data it keeps and the license.";

export const metadata: Metadata = pageMetadata({ title: "FAQ", description: DESCRIPTION, path: "/faq" });

export default function Faq() {
  const site = siteUrl();
  return (
    <ContentPage title="Questions" intro="Short answers to the questions testers and maintainers ask most.">
      <JsonLd
        data={[
          webPageLd(site, "/faq", "FAQ", DESCRIPTION),
          breadcrumbLd(site, [{ name: "Home", path: "/" }, { name: "FAQ", path: "/faq" }]),
          faqLd(FAQ),
        ]}
      />
      <FaqList items={FAQ} />
      <p className="text-muted">
        Another question? Read the <Link href="/privacy" className="text-ink underline underline-offset-4">privacy policy</Link>, or{" "}
        <Link href="/raghavg27/gitissue" className="text-ink underline underline-offset-4">ask it on GitHub with GitIssue</Link>.
      </p>
      <Link href="/#repo" className="pill h-12 px-6">Report a bug</Link>
    </ContentPage>
  );
}
