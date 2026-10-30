import type { RepoContext } from "@/lib/context/gather";
import type { IssueTemplate } from "@/lib/context/templates";
import { SCREENSHOT_MARKER } from "@/lib/issue-body";
import type { DeviceProfile, Draft, DuplicateMatch, Environment, IssueCandidate } from "@/lib/types";

export const DEFAULT_SECTIONS = [
  "Summary",
  "Steps to Reproduce",
  "Expected",
  "Actual",
  "Environment",
  "Screenshots",
  "Additional context",
];

const MAX_DUPLICATES = 5;

const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x) => typeof x === "string") : []);

function corpus(ctx: RepoContext): string {
  return [...ctx.screenFiles, ...ctx.codeSnippets.flatMap((s) => [s.path, s.text])].join("\n");
}

// FR-15: a screen/flow name survives only if it literally appears in the scanned code.
export function groundNames(names: string[], corpusText: string): string[] {
  const haystack = corpusText.toLowerCase();
  return names.filter((n) => n.trim() && haystack.includes(n.toLowerCase()));
}

function knownLabels(ctx: RepoContext): Set<string> {
  return new Set([...(ctx.template?.labels ?? []), ...ctx.recentIssues.flatMap((i) => i.labels)]);
}

export function parseDraft(raw: unknown, ctx: RepoContext): Draft {
  const r = raw as Record<string, unknown> | null;
  if (!r || typeof r !== "object" || typeof r.title !== "string" || typeof r.body !== "string") {
    throw new Error("AI response is not a draft");
  }
  const labels = knownLabels(ctx);
  const env = (r.environment && typeof r.environment === "object" ? r.environment : {}) as Record<string, unknown>;
  const environment: Environment = {};
  for (const k of ["platform", "osVersion", "device", "appVersion"] as const) {
    if (typeof env[k] === "string" && env[k]) environment[k] = env[k] as string;
  }
  return {
    title: r.title,
    body: r.body,
    labels: strings(r.labels).filter((l) => labels.has(l)),
    screenNames: groundNames(strings(r.screenNames), corpus(ctx)),
    missingFields: strings(r.missingFields),
    environment,
  };
}

export function parseAnalyzeResponse(
  raw: unknown,
  ctx: RepoContext,
  candidates: IssueCandidate[],
): { draft: Draft; duplicates: DuplicateMatch[] } {
  const draft = parseDraft(raw, ctx);
  const dups = (raw as { duplicates?: unknown }).duplicates;
  const duplicates: DuplicateMatch[] = [];
  for (const d of Array.isArray(dups) ? dups : []) {
    const c = candidates.find((c) => c.number === d?.number);
    if (!c || duplicates.some((x) => x.number === c.number)) continue;
    duplicates.push({
      number: c.number,
      title: c.title,
      state: c.state,
      url: c.url,
      authorLogin: c.authorLogin,
      reason: typeof d.reason === "string" ? d.reason : "",
    });
  }
  return { draft, duplicates: duplicates.slice(0, MAX_DUPLICATES) };
}

// Used when the AI is down or returns junk: the tester can still edit and post (§9 Reliability).
export function fallbackDraft(description: string, template: IssueTemplate | null): Draft {
  const draft = { labels: template?.labels ?? [], screenNames: [], environment: {} };
  if (template?.kind === "markdown" && template.body) {
    return { ...draft, title: template.title ?? "", body: `${description}\n\n${template.body}`, missingFields: [] };
  }
  const sections = template?.sections.length
    ? template.sections
    : DEFAULT_SECTIONS.map((label) => ({ label, required: false }));
  const body = sections
    .map((s, i) => {
      const content = i === 0 ? description : /screenshot/i.test(s.label) ? SCREENSHOT_MARKER : "_No response_";
      return `### ${s.label}\n\n${content}`;
    })
    .join("\n\n");
  return {
    ...draft,
    title: template?.title ?? "",
    body,
    missingFields: sections.slice(1).filter((s) => s.required).map((s) => s.label),
  };
}

function describeDevice(device?: DeviceProfile): string {
  if (!device) return "none selected";
  return [
    `${device.device_model} · ${device.platform} ${device.os_version}`,
    device.app_version && `app version ${device.app_version}`,
  ]
    .filter(Boolean)
    .join(", ");
}

function describeTemplate(t: IssueTemplate | null): string {
  if (!t) {
    return `No issue template. Use these "### " sections in order: ${DEFAULT_SECTIONS.join(", ")}.`;
  }
  if (t.kind === "form") {
    const fields = t.sections
      .map((s) => `- ${s.label}${s.required ? " (REQUIRED)" : ""}${s.description ? ` — ${s.description}` : ""}`)
      .join("\n");
    return `Issue form "${t.name}"${t.title ? `, title prefix "${t.title}"` : ""}. Render each field as "### <label>" followed by its answer, in this order:\n${fields}`;
  }
  return `Markdown template "${t.name}"${t.title ? `, title prefix "${t.title}"` : ""}. Keep its headings and structure, replacing the placeholder text:\n${t.body}`;
}

const DRAFT_RULES = `Rules:
- Write like a careful QA engineer. Be concrete and concise.
- NEVER invent steps, versions, devices, screen names or behaviour that are not in the dictation, the device profile or the repository context. If information a section needs is missing, write "_Not provided_" there and add that section's label to "missingFields".
- When the dictation refers to a screen, flow or component, use the real name found in the screen files or code below, and list each name you used in "screenNames". Only use names that appear verbatim in the context.
- Follow CONTRIBUTING rules and the title style of recent issues.
- Fill the environment section from the device profile and dictation only.
- In a screenshots section put exactly ${SCREENSHOT_MARKER} as its content. If there is no such section, don't add one.
- "labels": only labels that already appear on recent issues or in the template.`;

const DRAFT_SHAPE = `"title": string, "body": string (GitHub markdown), "labels": string[], "screenNames": string[], "missingFields": string[], "environment": {"platform"?: string, "osVersion"?: string, "device"?: string, "appVersion"?: string}`;

function repoContextBlock(ctx: RepoContext): string {
  const parts = [
    `## Issue format\n${describeTemplate(ctx.template)}`,
    ctx.contributing && `## CONTRIBUTING.md (excerpt)\n${ctx.contributing}`,
    ctx.readme && `## README.md (excerpt)\n${ctx.readme.slice(0, 2_000)}`,
    ctx.recentIssues.length &&
      `## Recent issues (house style)\n${ctx.recentIssues
        .map((i) => `- #${i.number} ${i.title}${i.labels.length ? ` [${i.labels.join(", ")}]` : ""}`)
        .join("\n")}`,
    ctx.screenFiles.length && `## Screen / route files\n${ctx.screenFiles.join("\n")}`,
    ctx.codeSnippets.length &&
      `## Relevant code\n${ctx.codeSnippets.map((s) => `--- ${s.path}\n${s.text}`).join("\n\n")}`,
  ];
  return parts.filter(Boolean).join("\n\n");
}

export function buildAnalyzePrompt(input: {
  description: string;
  device?: DeviceProfile;
  ctx: RepoContext;
  candidates: IssueCandidate[];
}): string {
  const candidates = input.candidates.length
    ? input.candidates
        .map((c) => `- #${c.number} [${c.state}] ${c.title}\n  ${c.body.slice(0, 400).replace(/\s+/g, " ")}`)
        .join("\n")
    : "(none)";
  return `You turn a tester's dictated bug report into a GitHub issue for this repository, and spot duplicates.

# Dictation
${input.description}

# Device profile
${describeDevice(input.device)}

# Repository context
${repoContextBlock(input.ctx)}

# Existing issues that might be the same bug
${candidates}

${DRAFT_RULES}
- "duplicates": only candidates that very likely describe the SAME bug (not just the same area), most likely first, each with a one-line "reason". Empty array if none.

Respond with a JSON object: {"duplicates": [{"number": number, "reason": string}], ${DRAFT_SHAPE}}`;
}

export function buildRefinePrompt(input: { draft: Draft; instruction: string; ctx: RepoContext }): string {
  return `You are editing a GitHub issue draft. Apply the tester's instruction and keep everything else.

# Current draft
Title: ${input.draft.title}

${input.draft.body}

# Instruction
${input.instruction}

# Repository context
${repoContextBlock(input.ctx)}

${DRAFT_RULES}

Respond with a JSON object: {${DRAFT_SHAPE}}`;
}

export function buildCommentPrompt(input: {
  description: string;
  device?: DeviceProfile;
  issue: { number: number; title: string; body: string; comments: string[] };
}): string {
  return `A tester hit a bug that is already tracked in issue #${input.issue.number}. Write a comment for that issue.

# Existing issue
Title: ${input.issue.title}

${input.issue.body.slice(0, 4_000)}

# Existing comments
${input.issue.comments.map((c) => `- ${c.slice(0, 500).replace(/\s+/g, " ")}`).join("\n") || "(none)"}

# New dictation
${input.description}

# Device profile
${describeDevice(input.device)}

Rules:
- Include ONLY information that is new compared to the issue and its comments (new steps, conditions, observations), plus an "Environment" line from the device profile and dictation.
- Never invent details. No greetings, no sign-off, no mention of any tool.
- If there are screenshots, end with ${SCREENSHOT_MARKER} on its own line.

Respond with a JSON object: {"body": string}`;
}

export function parseComment(raw: unknown): string {
  const body = (raw as { body?: unknown } | null)?.body;
  if (typeof body !== "string" || !body.trim()) throw new Error("AI response is not a comment");
  return body;
}
