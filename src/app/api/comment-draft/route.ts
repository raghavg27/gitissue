import { NextResponse, type NextRequest } from "next/server";
import { buildCommentPrompt, parseComment } from "@/lib/ai/draft";
import { generateJson } from "@/lib/ai/provider";
import { fail, limited, loadDevice, withRepo } from "@/lib/api";
import { SCREENSHOT_MARKER } from "@/lib/issue-body";
import { validateText } from "@/lib/validation";
import { logError } from "@/lib/log";
import { checkRateLimit } from "@/lib/rate-limit";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { owner, repo, issueNumber, description: rawDescription, deviceId } = await request.json();
  if (!Number.isSafeInteger(issueNumber) || issueNumber < 1) return fail(400, "Pick the issue to comment on.");
  const checked = validateText(rawDescription, "description");
  if (!checked.ok) return fail(400, checked.error);
  const description = checked.value;
  const result = await withRepo(owner, repo);
  if ("response" in result) return result.response;
  const limit = await checkRateLimit("draft", result.viewer.userId);
  if (limit) return limited(limit);
  const { viewer, access } = result;

  const [issue, comments, device] = await Promise.all([
    viewer.octokit.issues.get({ owner: access.owner, repo: access.repo, issue_number: issueNumber }),
    viewer.octokit.issues.listComments({ owner: access.owner, repo: access.repo, issue_number: issueNumber, per_page: 30 }),
    loadDevice(deviceId),
  ]);

  try {
    const raw = await generateJson(
      buildCommentPrompt({
        description,
        device,
        issue: {
          number: issueNumber,
          title: issue.data.title,
          body: issue.data.body ?? "",
          comments: comments.data.map((c) => c.body ?? ""),
        },
      }),
    );
    return NextResponse.json({ body: parseComment(raw) });
  } catch (e) {
    logError("comment-draft: AI failed", e);
    const env = device ? `\n\n**Environment:** ${device.device_model} · ${device.platform} ${device.os_version}` : "";
    return NextResponse.json({ body: `${description}${env}\n\n${SCREENSHOT_MARKER}`, aiError: "The AI could not draft the comment, so it holds your description. Edit it before you post." });
  }
}
