import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/ContentPage";
import { ExternalLink } from "@/components/ExternalLink";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLd, pageMetadata, webPageLd } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

const DESCRIPTION = "Watch GitIssue turn a spoken bug report into a GitHub issue that a developer can fix.";
const VIDEO_ID = "9vjFmfWYAlo";

export const metadata: Metadata = pageMetadata({ title: "Demo", description: DESCRIPTION, path: "/demo" });

export default function Demo() {
  const site = siteUrl();
  return (
    <ContentPage title="Demo" intro="See GitIssue go from a bug you say out loud to an issue on GitHub.">
      <JsonLd
        data={[
          webPageLd(site, "/demo", "Demo", DESCRIPTION),
          breadcrumbLd(site, [{ name: "Home", path: "/" }, { name: "Demo", path: "/demo" }]),
        ]}
      />
      <div className="glass overflow-hidden rounded-3xl">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}`}
          title="GitIssue demo video"
          className="aspect-video w-full"
          allow="encrypted-media; picture-in-picture; fullscreen"
          loading="lazy"
        />
      </div>
      <p className="text-muted">
        The video does not play?{" "}
        <ExternalLink href={`https://youtu.be/${VIDEO_ID}`} className="text-ink underline underline-offset-4">Watch it on YouTube</ExternalLink>.
      </p>
      <Link href="/#repo" className="pill h-12 px-6">Report a bug</Link>
    </ContentPage>
  );
}
