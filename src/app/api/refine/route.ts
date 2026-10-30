import { NextResponse, type NextRequest } from "next/server";
import { buildRefinePrompt, parseDraft } from "@/lib/ai/draft";
import { generateJson } from "@/lib/ai/provider";
import { fail, withRepo } from "@/lib/api";
import { gatherContext } from "@/lib/context/gather";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { owner, repo, draft, instruction } = await request.json();
  if (typeof instruction !== "string" || !instruction.trim() || typeof draft?.body !== "string") {
    return fail(400, "Say what to change.");
  }
  const result = await withRepo(owner, repo);
  if ("response" in result) return result.response;

  const ctx = await gatherContext(result.viewer.octokit, result.access, `${draft.title} ${instruction}`);
  try {
    const raw = await generateJson(buildRefinePrompt({ draft, instruction, ctx }));
    return NextResponse.json({ draft: parseDraft(raw, ctx) });
  } catch (e) {
    console.error("refine: AI failed", e);
    return fail(503, "The AI couldn't refine the draft. Edit it directly instead.");
  }
}
