import { NextResponse, type NextRequest } from "next/server";
import { buildAnalyzePrompt, fallbackDraft, parseAnalyzeResponse } from "@/lib/ai/draft";
import { generateJson } from "@/lib/ai/provider";
import { fail, loadDevice, withRepo } from "@/lib/api";
import { gatherContext } from "@/lib/context/gather";
import { duplicateOptions, searchCandidates } from "@/lib/duplicates";
import { extractKeywords } from "@/lib/keywords";
import { validateText } from "@/lib/validation";
import type { Draft, DuplicateMatch } from "@/lib/types";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { owner, repo, description: rawDescription, deviceId } = await request.json();
  const checked = validateText(rawDescription, "description");
  if (!checked.ok) return fail(400, checked.error);
  const description = checked.value;
  const result = await withRepo(owner, repo);
  if ("response" in result) return result.response;
  const { viewer, access } = result;

  const [ctx, candidates, device] = await Promise.all([
    gatherContext(viewer.octokit, access, description),
    searchCandidates(viewer.octokit, access.fullName, extractKeywords(description)).catch(() => []),
    loadDevice(deviceId),
  ]);

  let draft: Draft;
  let duplicates: DuplicateMatch[] = [];
  let aiError: string | undefined;
  try {
    const raw = await generateJson(buildAnalyzePrompt({ description, device, ctx, candidates }));
    ({ draft, duplicates } = parseAnalyzeResponse(raw, ctx, candidates));
  } catch (e) {
    console.error("analyze: AI failed", e);
    draft = fallbackDraft(description, ctx.template);
    aiError = "The AI couldn't draft this one, so here's the repo's template with your description. Edit it and post.";
  }

  return NextResponse.json({
    repo: access,
    draft,
    duplicates: duplicates.map((d) => ({ ...d, options: duplicateOptions(d, { login: viewer.login, canTriage: access.canTriage }) })),
    missing: ctx.missing,
    aiError,
  });
}
