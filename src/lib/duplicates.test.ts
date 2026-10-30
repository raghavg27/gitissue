import type { Octokit } from "@octokit/rest";
import { describe, expect, it, vi } from "vitest";
import { duplicateOptions, searchCandidates } from "./duplicates";

describe("duplicateOptions (§7.3)", () => {
  const issue = (state: "open" | "closed", authorLogin = "someone") => ({ state, authorLogin });

  it("open issue → comment", () => {
    expect(duplicateOptions(issue("open"), { login: "me", canTriage: false })).toEqual(["comment"]);
  });
  it("closed, viewer has triage → reopen", () => {
    expect(duplicateOptions(issue("closed"), { login: "me", canTriage: true })).toEqual(["reopen_comment"]);
  });
  it("closed, viewer opened it themselves without triage → reopen", () => {
    expect(duplicateOptions(issue("closed", "Me"), { login: "me", canTriage: false })).toEqual(["reopen_comment"]);
  });
  it("closed, cannot reopen → ask each time", () => {
    expect(duplicateOptions(issue("closed"), { login: "me", canTriage: false })).toEqual(["comment", "new_regression"]);
  });
});

const ghIssue = (number: number, extra = {}) => ({
  number,
  title: `Issue ${number}`,
  state: "closed",
  html_url: `https://github.com/o/r/issues/${number}`,
  user: { login: "dev" },
  body: null,
  ...extra,
});

describe("searchCandidates", () => {
  it("searches open and closed issues with the top keywords", async () => {
    const search = vi.fn().mockResolvedValue({ data: { items: [ghIssue(7)] } });
    const octokit = { search: { issuesAndPullRequests: search } } as unknown as Octokit;
    const result = await searchCandidates(octokit, "o/r", ["login", "blank", "home", "otp", "extra"]);
    expect(search.mock.calls[0][0].q).toBe("repo:o/r is:issue login OR blank OR home OR otp");
    expect(result).toEqual([
      { number: 7, title: "Issue 7", state: "closed", url: "https://github.com/o/r/issues/7", authorLogin: "dev", body: "" },
    ]);
  });

  it("falls back to recently updated issues when search fails, skipping PRs", async () => {
    const octokit = {
      search: { issuesAndPullRequests: vi.fn().mockRejectedValue(new Error("rate limited")) },
      issues: { listForRepo: vi.fn().mockResolvedValue({ data: [ghIssue(1), ghIssue(2, { pull_request: {} })] }) },
    } as unknown as Octokit;
    const result = await searchCandidates(octokit, "o/r", ["login"]);
    expect(result.map((c) => c.number)).toEqual([1]);
  });
});
