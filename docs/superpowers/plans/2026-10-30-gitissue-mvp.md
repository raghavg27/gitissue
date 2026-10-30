# GitIssue MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A phone-first web app that turns a dictated bug description into a GitHub issue that follows the repo's own conventions and uses its real screen names. When a duplicate exists, it comments on or reopens that issue instead.

**Architecture:** Next.js App Router on Vercel. Pure domain logic (URL parsing, template parsing, file selection, duplicate decision table, name grounding) lives in `src/lib/**` and is unit-tested with Vitest. Route handlers do all GitHub and AI calls server-side using the tester's stored, encrypted OAuth token. Supabase provides Auth (GitHub provider), Postgres with RLS, and public-read Storage for screenshots.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind 4, `@supabase/ssr` + `@supabase/supabase-js`, `@octokit/rest`, `@google/genai` (Gemini Flash), `yaml`, Vitest.

**Spec:** `docs/PRD.md` (v2.1)

## Global Constraints

- Free tiers only: Vercel Hobby, Supabase Free, Gemini free tier (G7, §9).
- The GitHub token never reaches the browser. It's stored AES-256-GCM-encrypted in `profiles.github_token_enc` and read only with the service-role client (FR-3).
- OAuth scope is `repo` (FR-2). The sign-in screen explains why, and says free-tier Gemini may use prompts for training (§13).
- Nothing is posted to GitHub without an explicit tap on the preview (anti-goal).
- The AI must not invent screen names: returned names are filtered against the scanned corpus (FR-15).
- Default bug structure: Summary, Steps to Reproduce, Expected, Actual, Environment, Screenshots, Additional context (FR-14).
- Screenshots: image/* only, ≤ 10 MB, ≤ 5 per report. Path is `<uuid>/<uuid>.<ext>` in public bucket `screenshots` (FR-25–27).
- Duplicate matches are shown max 5, with a reason, and require the tester to confirm (FR-22).
- No "Reported via GitIssue" footer (§14.5). Comments contain only new info plus environment (§14.4).
- App routes are single-segment (`/reports`, `/settings`, `/auth/*`, `/api/*`). `/<owner>/<repo>[/...]` is the report page (§7.2).
- `NEXT_PUBLIC_APP_URL` comes from config, never hard-coded.
- Phone-first: designed at 375px width; primary action in a sticky bottom bar.

## Decisions made without the owner (owner is AFK)

1. **The homepage and the URL shortcut share one page.** Pasting a URL on `/` navigates to `/<owner>/<repo>`. That gives §7.2 for free and keeps one flow.
2. **One AI call per analysis.** It returns duplicate re-ranking and the draft together, to meet the ~20 s target and save quota. The search keywords for duplicates and code-file selection come from local stopword-stripped extraction, not AI.
3. **Screenshots upload browser → Supabase Storage directly**, because Vercel caps function bodies at 4.5 MB, below the 10 MB limit. A storage RLS policy lets authenticated users insert; reads are public.
4. **Model:** `GEMINI_MODEL` env, default `gemini-3.8-flash`. Groq fallback is used only if `GROQ_API_KEY` is set (OpenAI-compatible endpoint, `GROQ_MODEL` default `llama-3.1-8b-instant`).
5. **Recent repos (FR-5)** use `localStorage`, not a DB table.
6. **Context cache (FR-10)** is in-memory per server instance, keyed by `full_name@sha`.

## Review Focus

1. **Repo URL in odd shapes** (`git@github.com:o/r.git`, `www.github.com/o/r/`, `o/r/issues/12`, trailing `#hash`) → must still resolve to `o/r`. Tested in Task 2.
2. **YAML issue form with `type: markdown` blocks and `validations.required`** → markdown blocks are not sections, and required fields appear in `requiredFields`. Tested in Task 4.
3. **AI returns screen names that don't exist in the repo** → they get dropped before reaching the preview. Tested in Task 5 (`groundNames`).
4. **AI returns malformed JSON or quota fails** → the tester still gets an editable template skeleton and an error banner; posting still works. Tested in Task 5 (`parseDraftResponse` fallback).
5. **Closed issue opened by someone else, tester without push** → reopen is not offered; comment and regression are. Tested in Task 6.

---

### Task 1: Scaffold + Supabase schema

**Files:**
- Create: Next.js app via `create-next-app` (TS, Tailwind, App Router, `src/`), `vitest.config.ts`, `.env.example`, `supabase/migrations/0001_init.sql`

- [ ] Scaffold with pnpm. Add deps: `@supabase/ssr @supabase/supabase-js @octokit/rest @google/genai yaml`; dev: `vitest`.
- [ ] `.env.example` keys: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `TOKEN_ENCRYPTION_KEY` (32-byte base64), `GEMINI_API_KEY`, `GEMINI_MODEL`, `GROQ_API_KEY`, `GROQ_MODEL`, `NEXT_PUBLIC_APP_URL`.
- [ ] Migration: tables `profiles(user_id pk → auth.users, github_login, github_token_enc, created_at)` with RLS on and no policies (service-role only); `device_profiles(id uuid, user_id, label, platform, os_version, device_model, app_version null, created_at)`; `reports(id, user_id, repo_full_name, issue_number, issue_url, action check in ('created','commented','reopened'), title, created_at)`. Both have RLS policies limiting rows to `user_id = auth.uid()` (select/insert/update/delete on device_profiles; select/insert on reports). Storage bucket `screenshots` is public, with `file_size_limit` 10485760 and `allowed_mime_types` `{image/*}`, plus an insert policy for `authenticated`.
- [ ] Verify: `pnpm build` and `pnpm vitest run` (no tests yet → passWithNoTests).
- [ ] Commit `chore(app): scaffold next.js app and supabase schema`.

### Task 2: Repo URL parsing

**Files:** Create `src/lib/repo-url.ts`, `src/lib/repo-url.test.ts`

**Produces:** `parseRepoUrl(input: string): { owner: string; repo: string } | null`

- [ ] Tests: `https://github.com/o/r` → o/r; `https://github.com/o/r.git`; `https://github.com/o/r/issues/12` → o/r; `o/r`; `git@github.com:o/r.git`; `www.github.com/o/r/`; `https://gitlab.com/o/r` → null; `just-text` → null; owner/repo containing invalid chars → null.
- [ ] Implement, run, commit `feat(repo): parse repository urls`.

### Task 3: Token crypto + Supabase clients + GitHub auth

**Files:** Create `src/lib/crypto.ts` (+test), `src/lib/supabase/{server,browser,admin}.ts`, `src/proxy.ts` (Next 16 renamed middleware to proxy), `src/app/auth/callback/route.ts`, `src/app/auth/signout/route.ts`, `src/lib/github/client.ts`

**Produces:**
- `encryptToken(plain: string): string`, `decryptToken(enc: string): string` (key from `TOKEN_ENCRYPTION_KEY`, format `iv.tag.ciphertext` base64)
- `createClient()` (server, cookie-bound), `createBrowserSupabase()`, `createAdminClient()` (service role)
- `getViewer(): Promise<{ userId: string; login: string; octokit: Octokit } | null>`

- [ ] Crypto test: round-trip; tampered ciphertext throws; two encryptions of the same value differ.
- [ ] Callback: `exchangeCodeForSession(code)`, then upsert `profiles` with the encrypted `session.provider_token` and `user_metadata.user_name`. Redirect to `next` param (must start with `/` and not `//`).
- [ ] Sign-out: delete the stored token (best-effort `DELETE /applications/{client_id}/grant` is skipped; it needs the client secret, so the token is just removed from the DB), call `auth.signOut()`, redirect `/` (FR-6).
- [ ] Commit `feat(auth): github oauth via supabase with encrypted token storage`.

### Task 4: Repo context gathering

**Files:** Create `src/lib/context/templates.ts` (+test), `src/lib/context/code-scan.ts` (+test), `src/lib/keywords.ts` (+test), `src/lib/context/gather.ts`, `src/lib/github/repo.ts`

**Produces:**
- `extractKeywords(text: string, max = 8): string[]`: lowercase, stopwords removed, length ≥ 3, deduped, order kept.
- `type IssueTemplate = { name: string; title?: string; labels: string[]; kind: 'markdown'|'form'; sections: { label: string; required: boolean; description?: string }[]; body?: string }`
- `parseMarkdownTemplate(path: string, text: string): IssueTemplate` (frontmatter name/title/labels; sections from `#`–`###` headings, none required)
- `parseFormTemplate(path: string, text: string): IssueTemplate` (YAML `body[]` without `type: markdown`; `attributes.label`, `validations.required`)
- `pickBugTemplate(ts: IssueTemplate[]): IssueTemplate | null`: first whose name or labels match `/bug/i`, else the first one.
- `selectCodeFiles(paths: string[], keywords: string[], max = 8): { screens: string[]; fetch: string[] }`: `screens` holds candidate screen and route files (patterns below, ≤ 60, keyword hits first). `fetch` holds the top `max` by score (keyword hits in path ×3, screen pattern +2, navigation/router file +2), excluding tests, `node_modules`, build dirs, and non-source extensions.
  Screen patterns: `/(screens?|pages?|app|routes?|views?|features?)\//i`, `/(Screen|Page|Activity|Fragment|ViewController|View)\.(tsx?|jsx?|kt|java|swift|dart)$/`, `/(navigat|router|routes)/i`.
- `getRepoAccess(octokit, owner, repo): Promise<{ fullName, private, defaultBranch, permissions: { push: boolean }, }>`
- `gatherContext(octokit, repo, description): Promise<RepoContext>` where `RepoContext = { template: IssueTemplate | null; contributing?: string; readme?: string; recentIssues: { number, title, labels: string[] }[]; screenFiles: string[]; codeSnippets: { path: string; text: string }[]; missing: string[]; sha: string }`. Each fetch fails soft into `missing` (FR-11). Docs are truncated to 6 KB each, snippets to 4 KB. Results are cached in a module `Map` by `fullName@sha` for templates, docs, and tree only.

- [ ] Tests: keywords; markdown template with frontmatter; form template where a markdown block is skipped and the required flag is kept; pickBugTemplate; selectCodeFiles excludes `node_modules/x/LoginScreen.tsx` and `__tests__`, and ranks `src/screens/LoginScreen.tsx` above `src/utils/date.ts` for keyword `login`.
- [ ] Commit per sub-unit: `feat(context): ...`.

### Task 5: AI provider + drafting

**Files:** Create `src/lib/ai/provider.ts`, `src/lib/ai/draft.ts` (+test)

**Produces:**
- `generateJson(prompt: string): Promise<unknown>`: tries Gemini (`responseMimeType: application/json`), then Groq if configured; throws `AiUnavailableError`.
- `type Draft = { title: string; body: string; labels: string[]; screenNames: string[]; missingFields: string[]; environment: { platform?: string; osVersion?: string; device?: string; appVersion?: string } }`
- `type DuplicateMatch = { number: number; title: string; state: 'open'|'closed'; url: string; reason: string; authorLogin: string }`
- `buildAnalyzePrompt(input: { description: string; device?: DeviceProfile; ctx: RepoContext; candidates: IssueCandidate[] }): string`
- `parseAnalyzeResponse(raw: unknown, ctx: RepoContext, candidates: IssueCandidate[]): { draft: Draft; duplicates: DuplicateMatch[] }`: validates shape, drops duplicate numbers not in candidates, caps at 5, applies `groundNames`.
- `groundNames(names: string[], corpus: string): string[]`: keeps names that appear case-insensitively in the corpus (screen paths + snippets).
- `fallbackDraft(description: string, template: IssueTemplate | null): Draft`: the skeleton, with the description under Summary and `missingFields` = required sections.
- `buildCommentPrompt(...)`/`parseComment(raw): string`, and `buildRefinePrompt(draft, instruction)`.

- [ ] Tests: groundNames drops `CheckoutScreen` when the corpus only has `LoginScreen`; parseAnalyzeResponse with garbage → throws (caller uses fallback); it drops unknown duplicate numbers; fallbackDraft with null template has all 7 default headings.
- [ ] Commit `feat(ai): gemini provider and grounded issue drafting`.

### Task 6: Duplicate search + action decision

**Files:** Create `src/lib/duplicates.ts` (+test)

**Produces:**
- `searchCandidates(octokit, fullName, keywords): Promise<IssueCandidate[]>`: `GET /search/issues` with `repo:o/r is:issue` + top 4 keywords (OR-joined), falling back to the 10 most recently updated issues if the search errors; max 10, open and closed.
- `type DupOption = 'comment' | 'reopen_comment' | 'new_regression'`
- `duplicateOptions(issue: { state: 'open'|'closed'; authorLogin: string }, viewer: { login: string; canPush: boolean }): DupOption[]`: open → `['comment']`; closed and able to reopen → `['reopen_comment']`; closed and not able → `['comment','new_regression']` (§7.3).

- [ ] Tests: the four rows of the §7.3 table, including "opened it myself without push → can reopen".
- [ ] Commit `feat(duplicates): candidate search and §7.3 action table`.

### Task 7: API routes

**Files:** Create `src/app/api/analyze/route.ts`, `src/app/api/comment-draft/route.ts`, `src/app/api/refine/route.ts`, `src/app/api/post/route.ts`, `src/app/api/repo/route.ts`

- `GET /api/repo?owner&repo` → `getRepoAccess` result, 404 if inaccessible.
- `POST /api/analyze {owner, repo, description, deviceId?}` → `{ draft, duplicates, missing, aiError?: string, repo }`. Builds draft from AI, or `fallbackDraft` on failure.
- `POST /api/comment-draft {owner, repo, issueNumber, description, deviceId?}` → `{ body }` (falls back to description + environment).
- `POST /api/refine {draft, instruction}` → `{ draft }`.
- `POST /api/post {owner, repo, action: 'create'|'comment'|'reopen_comment'|'new_regression', title?, body, labels?, issueNumber?, screenshots: string[]}` → `{ url, number }`. Appends `![screenshot](url)` lines. Regression prefixes the body with `Possible regression of #N`. Inserts a `reports` row (`new_regression` → `created`). Re-checks permission before reopening. Labels are only sent if they exist in the repo (silent best-effort).
- All routes return 401 without a viewer.
- [ ] Verify with `pnpm build`. Commit `feat(api): analyze, refine, comment and post routes`.

### Task 8: UI

**Files:** Create `src/app/page.tsx` (sign-in / paste repo / recent repos), `src/app/[owner]/[repo]/[[...rest]]/page.tsx` + `src/components/ReportFlow.tsx`, `src/components/MicButton.tsx`, `src/components/ScreenshotPicker.tsx`, `src/components/DevicePicker.tsx`, `src/app/settings/page.tsx`, `src/app/reports/page.tsx`

- Report flow state machine: `describe → analyzing → duplicates? → review → posted`, with a comment-review variant.
- Mic: `webkitSpeechRecognition || SpeechRecognition`, continuous, appends to the textarea; hidden if unsupported; pulsing red while recording.
- Review: editable title and body, chips for detected screen names, amber list for missing fields, private-repo screenshot warning, "Refine" input, sticky Post/Discard bar.
- Settings: add, select, and delete device profiles (FR-17/29). Reports: list (FR-28).
- [ ] Verify: `pnpm build`, and run dev at 375px to check that pages render (unauthenticated paths, since there are no real credentials).
- [ ] Commit per screen.

### Task 9: README + final verification

- [ ] README: setup (Supabase project, GitHub OAuth app with callback `https://<project>.supabase.co/auth/v1/callback`, Supabase GitHub provider with scope, env vars, `supabase db push`), and deploy to Vercel.
- [ ] `pnpm vitest run`, `pnpm lint`, `pnpm build` all green. Commit.
