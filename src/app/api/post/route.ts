import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { fail, limited, withRepo } from "@/lib/api";
import { issuesCreatedTag, reportsTag } from "@/lib/data";
import { publicEnv } from "@/lib/env";
import { duplicateOptions } from "@/lib/duplicates";
import { addAttribution, attachScreenshots } from "@/lib/issue-body";
import { siteUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";
import { MAX_SCREENSHOTS, validateIssue } from "@/lib/validation";
import { logError } from "@/lib/log";
import { checkRateLimit } from "@/lib/rate-limit";

type Action = "create" | "comment" | "reopen_comment" | "new_regression";
const ACTIONS: Action[] = ["create", "comment", "reopen_comment", "new_regression"];

// Only images uploaded to our own public bucket get embedded.
function validScreenshots(urls: unknown): string[] | null {
  if (urls === undefined) return [];
  const prefix = `${publicEnv.supabaseUrl}/storage/v1/object/public/screenshots/`;
  if (!Array.isArray(urls) || urls.length > MAX_SCREENSHOTS) return null;
  return urls.every((u) => typeof u === "string" && u.startsWith(prefix)) ? urls : null;
}

// The only place that writes to GitHub; called after the tester taps Post on the preview.
export async function POST(request: NextRequest) {
  const { owner, repo, action, issueNumber, screenshots, ...draft } = await request.json();
  const urls = validScreenshots(screenshots);
  if (!ACTIONS.includes(action)) return fail(400, "Pick what to post: an issue or a comment.");
  if (!urls) return fail(400, "Some screenshots are not from this app. Remove them and add them again.");
  const isNewIssue = action === "create" || action === "new_regression";
  const checked = validateIssue(draft, { needsTitle: isNewIssue });
  if (!checked.ok) return fail(400, checked.error);
  const { title, body, labels } = checked.value;
  if (!isNewIssue || action === "new_regression") {
    if (!Number.isSafeInteger(issueNumber) || issueNumber < 1) return fail(400, "Pick the issue to comment on.");
  }

  const result = await withRepo(owner, repo);
  if ("response" in result) return result.response;
  const limit = await checkRateLimit("post", result.viewer.userId);
  if (limit) return limited(limit);
  const { viewer, access } = result;
  const gh = viewer.octokit;
  const base = { owner: access.owner, repo: access.repo };
  const fullBody = addAttribution(attachScreenshots(body, urls), siteUrl());

  let url: string;
  let number: number;
  let recorded: "created" | "commented" | "reopened";
  let reportTitle: string;
  let reopenFailed = false;

  try {
    if (isNewIssue) {
      const { data } = await gh.issues.create({
        ...base,
        title,
        body: action === "new_regression" ? `Possible regression of #${issueNumber}\n\n${fullBody}` : fullBody,
        labels: labels.length ? labels : undefined,
      });
      url = data.html_url;
      number = data.number;
      recorded = "created";
      reportTitle = data.title;
    } else {
      const { data: issue } = await gh.issues.get({ ...base, issue_number: issueNumber });
      recorded = "commented";
      if (action === "reopen_comment" && issue.state === "closed") {
        const allowed = duplicateOptions(
          { state: "closed", authorLogin: issue.user?.login ?? "" },
          { login: viewer.login, canTriage: access.canTriage },
        ).includes("reopen_comment");
        try {
          if (!allowed) throw new Error("not allowed");
          await gh.issues.update({ ...base, issue_number: issueNumber, state: "open" });
          recorded = "reopened";
        } catch {
          // e.g. an author can't reopen an issue a maintainer closed; the comment still goes in.
          reopenFailed = true;
        }
      }
      const { data } = await gh.issues.createComment({ ...base, issue_number: issueNumber, body: fullBody });
      url = data.html_url;
      number = issueNumber;
      reportTitle = issue.title;
    }
  } catch (e) {
    logError("post: GitHub write failed", e);
    return fail(502, "GitHub did not accept the post. Your draft is saved. Check that you can still open the repo, then try again.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("reports").insert({
    user_id: viewer.userId,
    repo_full_name: access.fullName,
    issue_number: number,
    issue_url: url,
    action: recorded,
    title: reportTitle,
  });
  if (error) logError("post: saving report history failed", error);
  else {
    revalidateTag(reportsTag(viewer.userId), { expire: 0 });
    if (recorded === "created") revalidateTag(issuesCreatedTag, { expire: 0 });
  }

  // For the success screen: how many reports this tester has sent. Left out if the count fails.
  const { count } = await supabase.from("reports").select("id", { count: "exact", head: true }).eq("user_id", viewer.userId);

  return NextResponse.json({ url, number, action: recorded, reopenFailed, reportCount: count ?? undefined });
}
