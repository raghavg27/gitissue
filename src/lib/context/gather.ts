import type { Octokit } from "@octokit/rest";
import { getFileText, type RepoAccess } from "@/lib/github/repo";
import { extractKeywords } from "@/lib/keywords";
import { selectCodeFiles } from "./code-scan";
import { parseFormTemplate, parseMarkdownTemplate, pickBugTemplate, type IssueTemplate } from "./templates";

export type RecentIssue = { number: number; title: string; labels: string[] };

export type RepoContext = {
  template: IssueTemplate | null;
  contributing?: string;
  readme?: string;
  recentIssues: RecentIssue[];
  screenFiles: string[];
  codeSnippets: { path: string; text: string }[];
  missing: string[];
  sha: string;
};

const DOC_LIMIT = 6_000;
const SNIPPET_LIMIT = 4_000;

const TEMPLATE_FILE = /^(\.github\/ISSUE_TEMPLATE\/(?!config\.ya?ml$)[^/]+\.(md|ya?ml)|(\.github\/|docs\/)?ISSUE_TEMPLATE\.md)$/i;
const CONTRIBUTING = /^(\.github\/|docs\/)?CONTRIBUTING\.md$/i;
const README = /^README\.md$/i;

type Conventions = Pick<RepoContext, "template" | "contributing" | "readme" | "missing"> & { paths: string[] };

// Conventions + tree only depend on the commit, so they're cached per tree SHA (FR-10).
const cache = new Map<string, Conventions>();

async function loadConventions(octokit: Octokit, access: RepoAccess, sha: string, paths: string[], truncated: boolean) {
  const key = `${access.fullName}@${sha}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const missing: string[] = truncated ? ["full file tree (repo too large; code scan is partial)"] : [];
  const read = async (path: string | undefined, label: string) => {
    if (!path) return undefined;
    try {
      return (await getFileText(octokit, access, path)).slice(0, DOC_LIMIT);
    } catch {
      missing.push(label);
      return undefined;
    }
  };

  const templates: IssueTemplate[] = [];
  await Promise.all(
    paths
      .filter((p) => TEMPLATE_FILE.test(p))
      .map(async (p) => {
        const text = await read(p, `issue template ${p}`);
        if (text) templates.push(/\.ya?ml$/i.test(p) ? parseFormTemplate(p, text) : parseMarkdownTemplate(p, text));
      }),
  );
  const [contributing, readme] = await Promise.all([
    read(paths.find((p) => CONTRIBUTING.test(p)), "CONTRIBUTING.md"),
    read(paths.find((p) => README.test(p)), "README.md"),
  ]);

  const conventions = { template: pickBugTemplate(templates), contributing, readme, missing, paths };
  cache.set(key, conventions);
  return conventions;
}

// Gathers everything the drafter needs; each source fails soft into `missing` (FR-7..9, FR-11).
export async function gatherContext(octokit: Octokit, access: RepoAccess, description: string): Promise<RepoContext> {
  const missing: string[] = [];
  let sha = "";
  let paths: string[] = [];
  let truncated = false;
  try {
    const { data } = await octokit.git.getTree({
      owner: access.owner,
      repo: access.repo,
      tree_sha: access.defaultBranch,
      recursive: "true",
    });
    sha = data.sha;
    paths = data.tree.filter((t) => t.type === "blob" && t.path).map((t) => t.path!);
    truncated = data.truncated;
  } catch {
    missing.push("repository file tree (templates and code scan skipped)");
  }

  const [conventions, recentIssues] = await Promise.all([
    sha
      ? loadConventions(octokit, access, sha, paths, truncated)
      : Promise.resolve({ template: null, contributing: undefined, readme: undefined, missing: [], paths: [] }),
    octokit.issues
      .listForRepo({ owner: access.owner, repo: access.repo, state: "all", per_page: 20 })
      .then(({ data }) =>
        data
          .filter((i) => !i.pull_request)
          .map((i) => ({
            number: i.number,
            title: i.title,
            labels: i.labels.map((l) => (typeof l === "string" ? l : l.name ?? "")).filter(Boolean),
          })),
      )
      .catch(() => {
        missing.push("recent issues (house style)");
        return [] as RecentIssue[];
      }),
  ]);

  const { screens, fetch: filesToFetch } = selectCodeFiles(conventions.paths, extractKeywords(description));
  const codeSnippets = (
    await Promise.all(
      filesToFetch.map((path) =>
        getFileText(octokit, access, path)
          .then((text) => ({ path, text: text.slice(0, SNIPPET_LIMIT) }))
          .catch(() => null),
      ),
    )
  ).filter((s) => s !== null);

  return {
    template: conventions.template,
    contributing: conventions.contributing,
    readme: conventions.readme,
    recentIssues,
    screenFiles: screens,
    codeSnippets,
    missing: [...missing, ...conventions.missing],
    sha,
  };
}
