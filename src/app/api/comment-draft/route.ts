import { NextResponse, type NextRequest } from "next/server";
import { buildCommentPrompt, parseComment } from "@/lib/ai/draft";
import { generateJson } from "@/lib/ai/provider";
import { fail, loadDevice, withRepo } from "@/lib/api";
import { SCREENSHOT_MARKER } from "@/lib/issue-body";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { owner, repo, issueNumber, description, deviceId } = await request.json();
  if (typeof issueNumber !== "number" || typeof description !== "string") return fail(400, "Missing issue or description.");
  const result = await withRepo(owner, repo);
  if ("response" in result) return result.response;
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
    console.error("comment-draft: AI failed", e);
    const env = device ? `\n\n**Environment:** ${device.device_model} · ${device.platform} ${device.os_version}` : "";
    return NextResponse.json({ body: `${description}${env}\n\n${SCREENSHOT_MARKER}`, aiError: "The AI couldn't draft the comment. Edit it before posting." });
  }
}
