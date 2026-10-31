"use client";

import { useEffect, useState } from "react";
import type { DupOption } from "@/lib/duplicates";
import type { RepoAccess } from "@/lib/github/repo";
import { clearDraft, loadDraft, saveDraft } from "@/lib/drafts";
import { plural } from "@/lib/format";
import { rememberRepo } from "@/lib/recent-repos";
import { LIMITS } from "@/lib/validation";
import type { DeviceProfile, Draft, DuplicateMatch } from "@/lib/types";
import { ActionButton } from "./ActionButton";
import { ConfirmDialog } from "./ConfirmDialog";
import { DevicePicker } from "./DevicePicker";
import { ExternalLink } from "./ExternalLink";
import { MicButton } from "./MicButton";
import { ScreenshotPicker, type Shot } from "./ScreenshotPicker";
import { Spinner } from "./Spinner";

type Match = DuplicateMatch & { options: DupOption[] };
type Analysis = { draft: Draft; duplicates: Match[]; missing: string[]; aiError?: string };
type CommentAction = "comment" | "reopen_comment";

type Stage =
  | { name: "describe" }
  | { name: "analyzing" }
  | { name: "duplicates" }
  | { name: "choose"; match: Match }
  | { name: "review"; regressionOf?: number }
  | { name: "comment"; match: Match; action: CommentAction; body: string; aiError?: string }
  | { name: "posted"; url: string; number: number; action: string; reopenFailed: boolean };

// What is kept on the device between visits. A draft that was still analyzing goes back to the describe step.
type SavedDraft = { description: string; shots: Shot[]; analysis: Analysis | null; stage: Stage };

const ANALYZE_STEPS = [
  "Reading issue templates and contributing rules",
  "Scanning the code for screen names",
  "Checking open and closed issues for this bug",
  "Drafting the issue",
];

async function api<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => {
    throw new Error("Could not reach GitIssue. Check your internet and try again.");
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "GitIssue could not finish this step. Your text is saved. Try again in a minute.");
  return data;
}

// A small reward for a posted report. The library loads only now, and it stays still for reduced motion.
async function celebrate() {
  const { default: confetti } = await import("canvas-confetti");
  confetti({ particleCount: 90, spread: 70, origin: { y: 0.7 }, disableForReducedMotion: true });
}

const appendText = (prev: string, text: string) => (prev.trim() ? `${prev.trimEnd()} ${text}` : text);

// Shows the count only near the limit, so it helps without adding noise.
function CharCount({ id, value, max }: { id: string; value: string; max: number }) {
  const near = value.length > max * 0.8;
  return (
    <p id={id} className={`text-sm ${value.length > max ? "text-rec" : "text-muted"} ${near ? "" : "sr-only"}`}>
      {value.length.toLocaleString("en-US")} of {max.toLocaleString("en-US")} characters
    </p>
  );
}

function BottomBar({ children, shortcut = false }: { children: React.ReactNode; shortcut?: boolean }) {
  return (
    <div className="fixed inset-x-0 bottom-[var(--nav-h)] z-20 border-t border-line bg-paper/70 backdrop-blur-xl">
      {/* Above the phone navigation the safe area is already covered, so only the plain padding is needed. */}
      <div className="mx-auto flex max-w-xl gap-2 px-4 pt-3 pb-3 sm:pb-[max(0.75rem,env(safe-area-inset-bottom))]">{children}</div>
      {shortcut && (
        <p className="-mt-1 hidden pb-2 text-center text-xs text-muted sm:block">
          Press <kbd className="font-sans">⌘</kbd> or <kbd className="font-sans">Ctrl</kbd> + <kbd className="font-sans">Enter</kbd>
        </p>
      )}
    </div>
  );
}

const SHORTCUT = "Meta+Enter Control+Enter";

const primary = "pill h-14 flex-1 px-6 text-lg";
const secondary = "glass h-14 shrink-0 whitespace-nowrap rounded-full px-6 font-medium transition-colors hover:border-white/40 disabled:opacity-50";

export function ReportFlow({ repo, devices }: { repo: RepoAccess; devices: DeviceProfile[] }) {
  const [stage, setStage] = useState<Stage>({ name: "describe" });
  const [description, setDescription] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [shots, setShots] = useState<Shot[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState("");
  // Which server call is running, so only its button shows the spinner and every button stays disabled.
  const [busy, setBusy] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  const [restored, setRestored] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  useEffect(() => rememberRepo(repo.fullName), [repo.fullName]);

  // Restores after hydration, because the server cannot read this device's storage.
  useEffect(() => {
    const saved = loadDraft<SavedDraft>(repo.fullName);
    /* eslint-disable react-hooks/set-state-in-effect -- one-time read of device storage after hydration */
    if (typeof saved.description === "string") setDescription(saved.description);
    if (Array.isArray(saved.shots)) setShots(saved.shots);
    if (saved.analysis) {
      setAnalysis(saved.analysis);
      if (saved.stage && ["duplicates", "choose", "review", "comment"].includes(saved.stage.name)) setStage(saved.stage);
    }
    setRestored(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [repo.fullName]);

  useEffect(() => {
    if (!restored) return;
    if (stage.name === "posted") return clearDraft(repo.fullName);
    const kept = stage.name === "analyzing" ? { name: "describe" as const } : stage;
    saveDraft(repo.fullName, { description, shots, analysis, stage: kept } satisfies SavedDraft);
  }, [restored, repo.fullName, description, shots, analysis, stage]);

  useEffect(() => {
    if (stage.name !== "analyzing") return;
    const t = setInterval(() => setStep((s) => Math.min(s + 1, ANALYZE_STEPS.length - 1)), 2500);
    return () => clearInterval(t);
  }, [stage.name]);

  const repoArgs = { owner: repo.owner, repo: repo.repo };

  async function analyze() {
    setError("");
    setStep(0);
    setStage({ name: "analyzing" });
    try {
      const result = await api<Analysis>("/api/analyze", { ...repoArgs, description, deviceId });
      setAnalysis(result);
      setStage(result.duplicates.length ? { name: "duplicates" } : { name: "review" });
    } catch (e) {
      setError((e as Error).message);
      setStage({ name: "describe" });
    }
  }

  async function openComment(match: Match, action: CommentAction) {
    setBusy(`comment-${match.number}`);
    setError("");
    try {
      const { body, aiError } = await api<{ body: string; aiError?: string }>("/api/comment-draft", {
        ...repoArgs,
        issueNumber: match.number,
        description,
        deviceId,
      });
      setStage({ name: "comment", match, action, body, aiError });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  function sameBug(match: Match) {
    if (match.options.includes("new_regression")) return setStage({ name: "choose", match });
    openComment(match, match.options.includes("reopen_comment") ? "reopen_comment" : "comment");
  }

  async function post(payload: Record<string, unknown>) {
    setBusy("post");
    setError("");
    try {
      const result = await api<{ url: string; number: number; action: string; reopenFailed: boolean }>("/api/post", {
        ...repoArgs,
        ...payload,
        screenshots: shots.map((s) => s.url),
      });
      setStage({ name: "posted", ...result });
      celebrate().catch(() => {});
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const postIssue = (regressionOf?: number) =>
    analysis &&
    post({
      action: regressionOf ? "new_regression" : "create",
      issueNumber: regressionOf,
      title: analysis.draft.title,
      body: analysis.draft.body,
      labels: analysis.draft.labels,
    });

  // Cmd or Ctrl + Enter runs the main action of the step on screen.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // The "Change something" box has its own Enter key, so it never posts by accident.
      if (e.key !== "Enter" || !(e.metaKey || e.ctrlKey) || busy || (e.target as HTMLElement).id === "refine") return;
      if (stage.name === "describe" && description.trim()) analyze();
      else if (stage.name === "review" && analysis?.draft.title.trim()) postIssue(stage.regressionOf);
      else if (stage.name === "comment" && stage.body.trim())
        post({ action: stage.action, issueNumber: stage.match.number, body: stage.body });
      else return;
      e.preventDefault();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function reset() {
    clearDraft(repo.fullName);
    setDescription("");
    setShots([]);
    setAnalysis(null);
    setError("");
    setStage({ name: "describe" });
  }

  const errorBox = error && <p role="alert" className="rounded-2xl bg-warn-bg p-4 text-warn-ink">{error}</p>;
  const privateShotsWarning = repo.private && shots.length > 0 && (
    <p className="text-sm text-muted">
      This repo is private, but screenshot links are public: anyone who has the link can open the image.
    </p>
  );

  return (
    <div className="space-y-5 pb-32">
      <ConfirmDialog
        open={confirmDiscard}
        title="Discard this draft?"
        body="Your description, screenshots and draft will be removed from this device. This cannot be undone."
        confirmLabel="Discard draft"
        onCancel={() => setConfirmDiscard(false)}
        onConfirm={() => {
          setConfirmDiscard(false);
          reset();
        }}
      />
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="min-w-0 truncate text-2xl font-medium tracking-tight sm:text-3xl">{repo.fullName}</h1>
        <span className="glass shrink-0 rounded-full px-3 py-1 text-xs text-muted">
          {repo.private ? "Private" : "Public"}
        </span>
      </div>

      {stage.name === "describe" && (
        <>
          <div className="space-y-2">
            <label htmlFor="description" className="block font-medium">What went wrong?</label>
            <div className="flex items-start gap-3">
              <textarea
                id="description"
                maxLength={LIMITS.description.max}
                aria-describedby="description-count"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={7}
                placeholder="Say it the way you would tell the developer: what you did, what you expected, what happened instead."
                className="glass min-w-0 flex-1 rounded-3xl px-5 py-4 text-lg leading-relaxed"
              />
              <MicButton onText={(t) => setDescription((d) => appendText(d, t))} />
            </div>
            <CharCount id="description-count" value={description} max={LIMITS.description.max} />
          </div>
          <DevicePicker devices={devices} value={deviceId} onChange={setDeviceId} />
          <ScreenshotPicker shots={shots} onChange={setShots} />
          {privateShotsWarning}
          {repo.private && (
            <p className="text-sm text-muted">
              Your description and excerpts of this private repo&apos;s code are sent to Groq, or to Google
              Gemini&apos;s free tier as a backup, to draft the issue.
            </p>
          )}
          {errorBox}
          <BottomBar shortcut>
            <ActionButton onClick={analyze} disabled={!description.trim()} aria-keyshortcuts={SHORTCUT} className={primary}>Draft issue</ActionButton>
          </BottomBar>
        </>
      )}

      {stage.name === "analyzing" && (
        <ol className="glass space-y-4 rounded-3xl p-6" aria-live="polite" aria-busy="true" aria-label="Drafting the issue">
          {ANALYZE_STEPS.map((s, i) => (
            <li key={s} className={i <= step ? "text-ink" : "text-muted/50"}>
              <span className={`mr-2 inline-block h-2 w-2 rounded-full ${i < step ? "bg-ok" : i === step ? "animate-pulse bg-ink" : "bg-line"}`} />
              {s}
            </li>
          ))}
        </ol>
      )}

      {stage.name === "duplicates" && analysis && (
        <>
          <div className="space-y-1">
            <h2 className="text-xl font-medium">This might already be reported</h2>
            <p className="text-muted">
              GitIssue found {plural(analysis.duplicates.length, "possible match", "possible matches")}. If one is your bug,
              your findings go on that issue instead of a new one.
            </p>
          </div>
          <ul className="space-y-3">
            {analysis.duplicates.map((m) => (
              <li key={m.number} className="glass space-y-3 rounded-3xl p-5">
                <div className="space-y-1">
                  <ExternalLink href={m.url} className="line-clamp-2 font-medium underline-offset-2 hover:underline">
                    #{m.number} {m.title}
                  </ExternalLink>
                  <p className="text-sm">
                    <span className={m.state === "open" ? "text-ok" : "text-muted"}>{m.state === "open" ? "Open" : "Closed"}</span>
                    <span className="text-muted">. {m.reason}</span>
                  </p>
                </div>
                <ActionButton
                  onClick={() => sameBug(m)}
                  disabled={!!busy}
                  busy={busy === `comment-${m.number}`}
                  busyLabel="Drafting comment…"
                  className="glass h-11 w-full rounded-full px-5 font-medium transition-colors hover:border-white/40 disabled:opacity-50"
                >
                  This is my bug
                </ActionButton>
              </li>
            ))}
          </ul>
          {errorBox}
          <BottomBar>
            <button onClick={() => setStage({ name: "review" })} disabled={!!busy} className={primary}>
              It is a different bug
            </button>
          </BottomBar>
        </>
      )}

      {stage.name === "choose" && (
        <>
          <div className="space-y-1">
            <h2 className="text-xl font-medium">#{stage.match.number} is closed</h2>
            <p className="text-muted">You cannot reopen it on this repo. How should this report go in?</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => openComment(stage.match, "comment")}
              disabled={!!busy}
              aria-busy={busy === `comment-${stage.match.number}` || undefined}
              className="glass w-full rounded-3xl p-5 text-left transition-colors hover:border-white/40 disabled:opacity-50"
            >
              <span className="flex items-center gap-2 font-medium">
                {busy === `comment-${stage.match.number}` && <Spinner />}
                {busy === `comment-${stage.match.number}` ? "Drafting comment…" : `Comment on #${stage.match.number}`}
              </span>
              <span className="text-sm text-muted">Maintainers watching it get notified.</span>
            </button>
            <button onClick={() => setStage({ name: "review", regressionOf: stage.match.number })} disabled={!!busy} className="glass w-full rounded-3xl p-5 text-left transition-colors hover:border-white/40 disabled:opacity-50">
              <span className="block font-medium">New issue as a possible regression</span>
              <span className="text-sm text-muted">Opens a fresh issue that links back to #{stage.match.number}.</span>
            </button>
          </div>
          {errorBox}
        </>
      )}

      {stage.name === "review" && analysis && (
        <DraftReview
          repo={repo}
          analysis={analysis}
          regressionOf={stage.regressionOf}
          onDraft={(draft) => setAnalysis({ ...analysis, draft })}
          footer={
            <>
              {shots.length > 0 && <ScreenshotPicker shots={shots} onChange={setShots} />}
              {privateShotsWarning}
              {errorBox}
              <BottomBar shortcut>
                <button onClick={() => setConfirmDiscard(true)} disabled={!!busy} className={secondary}>Discard</button>
                <ActionButton
                  onClick={() => postIssue(stage.regressionOf)}
                  aria-keyshortcuts={SHORTCUT}
                  disabled={!analysis.draft.title.trim()}
                  busy={busy === "post"}
                  busyLabel="Posting…"
                  className={primary}
                >
                  Post issue
                </ActionButton>
              </BottomBar>
            </>
          }
        />
      )}

      {stage.name === "comment" && (
        <>
          <div className="space-y-1">
            <h2 className="text-xl font-medium">
              {stage.action === "reopen_comment" ? "Reopen" : "Comment on"} #{stage.match.number}
            </h2>
            <p className="line-clamp-2 text-muted">{stage.match.title}</p>
          </div>
          {stage.aiError && <p role="status" className="rounded-2xl bg-warn-bg p-4 text-warn-ink">{stage.aiError}</p>}
          <label htmlFor="comment" className="sr-only">Comment</label>
          <textarea
            id="comment"
            maxLength={LIMITS.body.max}
            value={stage.body}
            onChange={(e) => setStage({ ...stage, body: e.target.value })}
            rows={12}
            className="glass w-full rounded-3xl px-5 py-4 leading-relaxed"
          />
          {shots.length > 0 && <ScreenshotPicker shots={shots} onChange={setShots} />}
          {privateShotsWarning}
          {errorBox}
          <BottomBar shortcut>
            <button onClick={() => setConfirmDiscard(true)} disabled={!!busy} className={secondary}>Discard</button>
            <ActionButton
              onClick={() => post({ action: stage.action, issueNumber: stage.match.number, body: stage.body })}
              aria-keyshortcuts={SHORTCUT}
              disabled={!stage.body.trim()}
              busy={busy === "post"}
              busyLabel="Posting…"
              className={primary}
            >
              {stage.action === "reopen_comment" ? "Reopen and comment" : "Post comment"}
            </ActionButton>
          </BottomBar>
        </>
      )}

      {stage.name === "posted" && (
        <div className="space-y-4 pt-4">
          <h2 role="status" className="text-3xl font-medium tracking-tight sm:text-4xl">
            {stage.action === "created" ? "Issue created" : stage.action === "reopened" ? "Issue reopened" : "Comment posted"}
          </h2>
          <ExternalLink href={stage.url} className="block truncate text-lg font-medium underline underline-offset-4">
            {repo.fullName}#{stage.number}
          </ExternalLink>
          {stage.reopenFailed && (
            <p role="status" className="rounded-2xl bg-warn-bg p-4 text-warn-ink">
              GitHub did not let you reopen this issue, so it stays closed. Your comment was posted.
            </p>
          )}
          <BottomBar>
            <button onClick={reset} className={primary}>Report another bug</button>
          </BottomBar>
        </div>
      )}
    </div>
  );
}

function DraftReview({
  repo,
  analysis,
  regressionOf,
  onDraft,
  footer,
}: {
  repo: RepoAccess;
  analysis: Analysis;
  regressionOf?: number;
  onDraft: (d: Draft) => void;
  footer: React.ReactNode;
}) {
  const { draft, missing, aiError } = analysis;
  const [instruction, setInstruction] = useState("");
  const [refining, setRefining] = useState(false);
  const [refineError, setRefineError] = useState("");

  async function refine() {
    setRefining(true);
    setRefineError("");
    try {
      const { draft: next } = await api<{ draft: Draft }>("/api/refine", {
        owner: repo.owner,
        repo: repo.repo,
        draft,
        instruction,
      });
      onDraft(next);
      setInstruction("");
    } catch (e) {
      setRefineError((e as Error).message);
    } finally {
      setRefining(false);
    }
  }

  return (
    <>
      {aiError && <p role="status" className="rounded-2xl bg-warn-bg p-4 text-warn-ink">{aiError}</p>}
      {draft.missingFields.length > 0 && (
        <div className="rounded-2xl bg-warn-bg p-4 text-warn-ink">
          <p className="font-medium">
            The repo asks for {plural(draft.missingFields.length, "detail")} that you did not mention
          </p>
          <ul className="mt-1 list-disc pl-5">
            {draft.missingFields.map((f) => <li key={f}>{f}</li>)}
          </ul>
          <p className="mt-2 text-sm">Add them in the body, or dictate them below.</p>
        </div>
      )}
      {draft.screenNames.length > 0 && (
        <p className="leading-loose">
          <span className="text-muted">Names from the code: </span>
          {draft.screenNames.map((n, i) => (
            <span key={n}>
              {i > 0 && " "}
              <code className="marker font-bold">{n}</code>
            </span>
          ))}
        </p>
      )}
      {regressionOf && (
        <p className="text-sm text-muted">The issue will start with &ldquo;Possible regression of #{regressionOf}&rdquo;.</p>
      )}
      <div className="space-y-2">
        <label htmlFor="title" className="block font-medium">Title</label>
        <input
          id="title"
          maxLength={LIMITS.title.max}
          value={draft.title}
          onChange={(e) => onDraft({ ...draft, title: e.target.value })}
          className="glass h-14 w-full rounded-full px-5 text-lg font-medium"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="body" className="block font-medium">Body</label>
        <textarea
          id="body"
          maxLength={LIMITS.body.max}
          value={draft.body}
          onChange={(e) => onDraft({ ...draft, body: e.target.value })}
          rows={16}
          className="glass w-full rounded-3xl px-5 py-4 leading-relaxed"
        />
      </div>
      {draft.labels.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted">Labels:</span>
          {draft.labels.map((l) => (
            <button
              key={l}
              onClick={() => onDraft({ ...draft, labels: draft.labels.filter((x) => x !== l) })}
              aria-label={`Remove label ${l}`}
              className="glass max-w-full truncate rounded-full px-3 py-1 transition-colors hover:border-white/40"
            >
              {l} ×
            </button>
          ))}
        </div>
      )}
      <div className="space-y-2">
        <label htmlFor="refine" className="block font-medium">Change something</label>
        <div className="flex items-center gap-2">
          <input
            id="refine"
            maxLength={LIMITS.instruction.max}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !refining && instruction.trim()) {
                e.preventDefault();
                refine();
              }
            }}
            aria-keyshortcuts="Enter"
            placeholder="e.g. add that it only happens on slow network"
            className="glass h-12 min-w-0 flex-1 rounded-full px-5"
          />
          <MicButton size="sm" onText={(t) => setInstruction((s) => appendText(s, t))} />
          <ActionButton
            onClick={refine}
            disabled={!instruction.trim()}
            busy={refining}
            busyLabel="Updating…"
            className="glass h-12 rounded-full px-5 font-medium transition-colors hover:border-white/40 disabled:opacity-50"
          >
            Apply
          </ActionButton>
        </div>
        {refineError && <p role="alert" className="text-sm text-rec">{refineError}</p>}
      </div>
      {missing.length > 0 && (
        <p className="text-sm text-muted">Drafted without: {missing.join("; ")}.</p>
      )}
      {footer}
    </>
  );
}
