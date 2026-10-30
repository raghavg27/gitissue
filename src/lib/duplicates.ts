import type { Octokit } from "@octokit/rest";
import type { IssueCandidate } from "@/lib/types";

export type DupOption = "comment" | "reopen_comment" | "new_regression";

const MAX_CANDIDATES = 10;

type GhIssue = {
  number: number;
  title: string;
  state: string;
  html_url: string;
  user: { login: string } | null;
  body?: string | null;
  pull_request?: unknown;
};

function toCandidate(i: GhIssue): IssueCandidate {
  return {
    number: i.number,
    title: i.title,
    state: i.state === "open" ? "open" : "closed",
    url: i.html_url,
    authorLogin: i.user?.login ?? "",
    body: i.body ?? "",
  };
}

// Open AND closed issues matching the dictation keywords (FR-21); AI re-ranks them afterwards.
export async function searchCandidates(octokit: Octokit, fullName: string, keywords: string[]): Promise<IssueCandidate[]> {
  try {
    if (!keywords.length) throw new Error("no keywords");
    const { data } = await octokit.search.issuesAndPullRequests({
      q: `repo:${fullName} is:issue ${keywords.slice(0, 4).join(" OR ")}`,
      per_page: MAX_CANDIDATES,
    });
    return data.items.map(toCandidate);
  } catch {
    const [owner, repo] = fullName.split("/");
    const { data } = await octokit.issues.listForRepo({ owner, repo, state: "all", sort: "updated", per_page: 30 });
    return data.filter((i) => !i.pull_request).slice(0, MAX_CANDIDATES).map(toCandidate);
  }
}

// §7.3: GitHub lets you reopen if you have triage access or opened the issue (an author can still be refused if a maintainer closed it).
export function duplicateOptions(
  issue: { state: "open" | "closed"; authorLogin: string },
  viewer: { login: string; canTriage: boolean },
): DupOption[] {
  if (issue.state === "open") return ["comment"];
  const canReopen = viewer.canTriage || issue.authorLogin.toLowerCase() === viewer.login.toLowerCase();
  return canReopen ? ["reopen_comment"] : ["comment", "new_regression"];
}
