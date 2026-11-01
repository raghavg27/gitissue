import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";
import { ExternalLink } from "@/components/ExternalLink";
import { JsonLd } from "@/components/JsonLd";
import { Prose } from "@/components/Prose";
import { breadcrumbLd, pageMetadata, webPageLd } from "@/lib/seo";
import { REPO_URL, SECURITY_URL, siteUrl } from "@/lib/site";

const DESCRIPTION = "What data GitIssue keeps, why, how long, and each outside service that receives it.";

export const metadata: Metadata = pageMetadata({ title: "Privacy policy", description: DESCRIPTION, path: "/privacy" });

// Update this page in the same change that adds a new outside service (see CONTRIBUTING.md).
export default function Privacy() {
  const site = siteUrl();
  return (
    <ContentPage title="Privacy policy" intro="Last changed on 1 November 2026.">
      <JsonLd
        data={[
          webPageLd(site, "/privacy", "Privacy policy", DESCRIPTION),
          breadcrumbLd(site, [{ name: "Home", path: "/" }, { name: "Privacy policy", path: "/privacy" }]),
        ]}
      />
      <Prose>
        <p>GitIssue keeps as little personal data as possible. This page tells you what it keeps, why, for how long, and which outside services receive data.</p>

        <h2>What GitIssue keeps</h2>
        <ul>
          <li><strong>Your GitHub account ID and user name</strong>, to know who is signed in.</li>
          <li><strong>Your GitHub access token</strong>, encrypted with AES-256-GCM, to read repos and post the issues that you approve. Sign-out deletes it.</li>
          <li><strong>Your saved devices</strong> (device name, platform, OS and app version), until you delete them.</li>
          <li><strong>A list of your reports</strong> (repo, issue number, link, title and date), to show My reports.</li>
          <li><strong>Screenshots that you add.</strong> They are stored at a long random address that anyone with the link can open, because GitHub must load them in the issue.</li>
          <li><strong>Rate-limit counters.</strong> Your IP address, a random device ID and your account ID are hashed with a secret key before they are stored. The hashes are deleted within one day.</li>
        </ul>
        <p>GitIssue does not keep your email address. It does not keep the text that you dictate after the issue is posted; that text is in the GitHub issue, under your name.</p>

        <h2>What stays on your device</h2>
        <p>Your draft, recent repos and last device choice are kept in the local storage of your browser. They do not leave your device until you ask for a draft or post. GitIssue uses only two kinds of cookies: the ones that keep you signed in, and one with a random device ID that is used, as a hash, only for rate limits. It does not use cookies for analytics or ads.</p>

        <h2>Outside services that receive data</h2>
        <table>
          <thead>
            <tr><th>Service</th><th>What it receives</th><th>Why</th></tr>
          </thead>
          <tbody>
            <tr><td>GitHub</td><td>Your sign-in, and the issues and comments that you post</td><td>Sign-in, reading repos, posting</td></tr>
            <tr><td>Supabase</td><td>The data in the list above</td><td>Sign-in, database and screenshot storage</td></tr>
            <tr><td>Groq</td><td>Your description, device details and short parts of the repo code and docs</td><td>Writing the draft</td></tr>
            <tr><td>Google Gemini</td><td>The same as Groq, only when Groq fails. The free tier lets Google use this data to improve its models.</td><td>Backup for the draft</td></tr>
            <tr><td>Vercel</td><td>Requests to the site, and cookieless page views and speed numbers</td><td>Hosting, Web Analytics and Speed Insights</td></tr>
          </tbody>
        </table>
        <p>The buttons on the Support GitIssue page open Buy Me a Coffee and GitHub Sponsors. These services receive data only if you choose to go there.</p>

        <h2>Your choices</h2>
        <ul>
          <li>Sign out to delete your stored GitHub token.</li>
          <li>Delete saved devices on the Devices page.</li>
          <li>Revoke GitIssue in GitHub, under Settings, Applications.</li>
          <li>To delete all your data, send a private request through <ExternalLink href={SECURITY_URL}>GitHub private reporting</ExternalLink>.</li>
        </ul>

        <h2>Changes</h2>
        <p>
          When GitIssue starts to use a new outside service, this page changes in the same update. The history of this page is in the{" "}
          <ExternalLink href={`${REPO_URL}/commits/main/src/app/privacy/page.tsx`}>source code</ExternalLink>.
        </p>
      </Prose>
    </ContentPage>
  );
}
