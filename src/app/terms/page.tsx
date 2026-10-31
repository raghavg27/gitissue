import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/ContentPage";
import { ExternalLink } from "@/components/ExternalLink";
import { JsonLd } from "@/components/JsonLd";
import { Prose } from "@/components/Prose";
import { breadcrumbLd, pageMetadata, webPageLd } from "@/lib/seo";
import { REPO_URL, siteUrl } from "@/lib/site";

const DESCRIPTION = "The rules for using GitIssue: what you agree to, what GitIssue does and does not promise.";

export const metadata: Metadata = pageMetadata({ title: "Terms of use", description: DESCRIPTION, path: "/terms" });

export default function Terms() {
  const site = siteUrl();
  return (
    <ContentPage title="Terms of use" intro="Last changed on 31 October 2026.">
      <JsonLd
        data={[
          webPageLd(site, "/terms", "Terms of use", DESCRIPTION),
          breadcrumbLd(site, [{ name: "Home", path: "/" }, { name: "Terms of use", path: "/terms" }]),
        ]}
      />
      <Prose>
        <p>When you use GitIssue, you agree to these terms. If you do not agree, do not use GitIssue.</p>

        <h2>What GitIssue does</h2>
        <p>GitIssue helps you write GitHub issues and comments. It posts to GitHub only when you tap Post, with your own GitHub account.</p>

        <h2>Your responsibility</h2>
        <ul>
          <li>You are responsible for each issue and comment that you post. Read the draft before you post it.</li>
          <li>Follow the rules of GitHub and of each repo that you post to.</li>
          <li>Do not use GitIssue to send spam, to harass people, or to post private data of other people.</li>
          <li>Do not try to get around the rate limits or to attack the service.</li>
        </ul>

        <h2>AI drafts</h2>
        <p>An AI writes the draft. It can be wrong. Check the facts, the steps and the screen names before you post.</p>

        <h2>No promise</h2>
        <p>GitIssue is free and is given &quot;as is&quot;, with no promise that it works without errors or at all times. The limits of the MIT license also apply to the hosted service.</p>

        <h2>Changes and ending</h2>
        <p>These terms can change. The service can change or stop. You can stop to use GitIssue at any time and revoke its access in GitHub.</p>

        <h2>More</h2>
        <p>
          Read the <Link href="/privacy">privacy policy</Link>. The source code is on <ExternalLink href={REPO_URL}>GitHub</ExternalLink>.
        </p>
      </Prose>
    </ContentPage>
  );
}
