import { FAQ, FEATURES } from "@/content/features";
import { PRIVATE_PATHS, PUBLIC_PAGES } from "@/content/pages";
import { REPO_URL } from "./site";

const SUMMARY =
  "GitIssue turns a spoken or typed bug description into a GitHub issue that follows the repo's own issue template and contributing rules, uses real screen names from the repo's code, and goes on the existing issue when the bug is already reported. Nothing is posted until the user approves it.";

// Plain-text answers for AI tools. Static files with a day of cache, built from the same content as the pages.
export function textResponse(body: string) {
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" },
  });
}

// https://llmstxt.org: a short map of the site for language models.
export function llmsTxt(site: string): string {
  const pages = PUBLIC_PAGES.map((p) => `- [${p.name}](${site}${p.path}): ${p.description}`).join("\n");
  return `# GitIssue

> ${SUMMARY}

## Pages

${pages}

## Optional

- [Full text](${site}/llms-full.txt): every feature, the reason for it, and the FAQ.
- [Source code](${REPO_URL}): MIT licensed.
`;
}

export function llmsFullTxt(site: string): string {
  const features = FEATURES.map((f) => `### ${f.name}\n\n${f.what}\n\nWhy: ${f.why}`).join("\n\n");
  const faq = FAQ.map((item) => `### ${item.q}\n\n${item.a}`).join("\n\n");
  return `# GitIssue

> ${SUMMARY}

Site: ${site}
Source code: ${REPO_URL} (MIT license)

## How it works

1. Open a repo: paste its GitHub link, or change github.com to the GitIssue address on any repo page.
2. Say or type what went wrong. Pick a saved device and add screenshots if you want.
3. GitIssue reads the repo's issue templates, CONTRIBUTING, README, recent issues and code, and checks for duplicate issues.
4. Review the draft. Edit it, or ask for a change in plain words.
5. Tap Post. GitIssue creates the issue, or comments on (and reopens, when allowed) the existing one.

## Features

${features}

## Questions

${faq}
`;
}

// https://site.spawning.ai/spawning-ai-txt: which content AI training may use. The public pages are open.
export function aiTxt(): string {
  return `# ai.txt for GitIssue
User-Agent: *
Allow: /
${PRIVATE_PATHS.map((p) => `Disallow: ${p}`).join("\n")}
`;
}
