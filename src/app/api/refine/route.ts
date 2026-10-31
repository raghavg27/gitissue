import { NextResponse, type NextRequest } from "next/server";
import { buildRefinePrompt, parseDraft } from "@/lib/ai/draft";
import { generateJson } from "@/lib/ai/provider";
import { fail, withRepo } from "@/lib/api";
import { gatherContext } from "@/lib/context/gather";
import { validateIssue, validateText } from "@/lib/validation";
import { logError } from "@/lib/log";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { owner, repo, draft: rawDraft, instruction: rawInstruction } = await request.json();
  const instruction = validateText(rawInstruction, "instruction");
  if (!instruction.ok) return fail(400, instruction.error);
  const issue = validateIssue(rawDraft ?? {}, { needsTitle: false });
  if (!issue.ok) return fail(400, issue.error);
  const draft = { ...rawDraft, ...issue.value };
  const result = await withRepo(owner, repo);
  if ("response" in result) return result.response;

  const ctx = await gatherContext(result.viewer.octokit, result.access, `${draft.title} ${instruction.value}`);
  try {
    const raw = await generateJson(buildRefinePrompt({ draft, instruction: instruction.value, ctx }));
    return NextResponse.json({ draft: parseDraft(raw, ctx) });
  } catch (e) {
    logError("refine: AI failed", e);
    return fail(503, "The AI couldn't refine the draft. Edit it directly instead.");
  }
}
