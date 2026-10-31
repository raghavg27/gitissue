import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { JsonLd } from "@/components/JsonLd";
import { RepoPicker } from "@/components/RepoPicker";
import { getViewer } from "@/lib/github/client";
import { REPO_URL_ERROR } from "@/lib/repo-url";
import { organizationLd, pageMetadata, webAppLd, websiteLd } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

const DESCRIPTION =
  "Dictate a bug from your phone and get a GitHub issue that follows the repo's template, uses real screen names from its code and lands on the existing issue when the bug is already reported.";

export const metadata: Metadata = pageMetadata({
  title: "GitIssue · Say the bug out loud",
  absoluteTitle: true,
  description: DESCRIPTION,
  path: "/",
});

export default async function Home({ searchParams }: PageProps<"/">) {
  const viewer = await getViewer();
  const { error } = await searchParams;

  const site = siteUrl();
  return (
    <Hero
      signedIn={!!viewer}
      badge="For testers on any GitHub repo"
      title="Say the bug out loud"
      sub="Turn 30 seconds of talking into a bug report developers can fix right away. GitIssue follows the repo's template, names the real screens and adds to an existing issue when one is already open."
    >
      {error === "auth" && (
        <p role="alert" className="mb-4 rounded-2xl bg-warn-bg px-5 py-3 text-warn-ink">GitHub sign-in did not finish. Try again.</p>
      )}
      <JsonLd data={[websiteLd(site, DESCRIPTION), organizationLd(site), webAppLd(site, DESCRIPTION)]} />
      <RepoPicker initialError={error === "repo" ? REPO_URL_ERROR : ""} />
      {!viewer && (
        <p className="mt-6 text-sm text-muted">No account is needed to start. You sign in with GitHub when you are ready to draft.</p>
      )}
    </Hero>
  );
}
