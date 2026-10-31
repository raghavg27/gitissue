"use client";

import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore, useTransition } from "react";
import { usePageRestore } from "@/hooks/usePageRestore";
import { readRecentRepos } from "@/lib/recent-repos";
import { parseRepoUrl, REPO_URL_ERROR } from "@/lib/repo-url";
import { ActionButton } from "./ActionButton";
import { NavLink } from "./NavLink";

const noSubscribe = () => () => {};
const appHost = process.env.NEXT_PUBLIC_APP_URL && new URL(process.env.NEXT_PUBLIC_APP_URL).host;

// Without JavaScript the form still works: it sends a GET to /open, which redirects to the repo.
export function RepoPicker({ initialError = "" }: { initialError?: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState(initialError);
  const [opening, startOpening] = useTransition();
  usePageRestore(() => setError(""));
  const recent = useSyncExternalStore(noSubscribe, () => readRecentRepos().join("\n"), () => "")
    .split("\n")
    .filter(Boolean);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const ref = parseRepoUrl(value);
    if (!ref) return setError(REPO_URL_ERROR);
    startOpening(() => router.push(`/${ref.owner}/${ref.repo}`));
  }

  return (
    <div className="space-y-6">
      <form action="/open" method="get" onSubmit={submit} className="space-y-3">
        <label htmlFor="repo" className="sr-only">
          Which repo are you testing?
        </label>
        <div className="glass flex h-14 items-center rounded-full pr-1.5 pl-5 shadow-sm focus-within:border-white/40 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-ink sm:h-16 sm:pl-6">
          <input
            id="repo"
            name="repo"
            required
            aria-invalid={!!error || undefined}
            aria-describedby={[error && "repo-error", appHost && "repo-hint"].filter(Boolean).join(" ") || undefined}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError("");
              // Start loading the repo page as soon as the link is valid, so Open feels instant.
              const ref = parseRepoUrl(e.target.value);
              if (ref) router.prefetch(`/${ref.owner}/${ref.repo}`);
            }}
            placeholder="github.com/owner/repo"
            autoCapitalize="none"
            autoCorrect="off"
            inputMode="url"
            className="h-full min-w-0 flex-1 bg-transparent text-base outline-none sm:text-lg"
          />
          <ActionButton busy={opening} busyLabel="Opening…" className="pill h-11 shrink-0 px-5 text-[0.95rem] sm:h-12 sm:px-6">
            Open repo
          </ActionButton>
        </div>
        {error && <p id="repo-error" role="alert" className="text-sm text-rec">{error}</p>}
        {appHost && (
          <div id="repo-hint" className="space-y-1.5 text-sm text-muted">
            <p>Already on a GitHub repo? Change the start of its link to open it here.</p>
            <p className="flex flex-wrap items-center justify-center gap-x-2 font-mono text-xs sm:text-sm">
              <span>
                <s className="opacity-70">github.com</s>/owner/repo
              </span>
              <span aria-hidden>→</span>
              <span className="sr-only">becomes</span>
              <span>
                <span className="text-ink">{appHost}</span>/owner/repo
              </span>
            </p>
          </div>
        )}
      </form>
      {recent.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm text-muted">Recent</h2>
          <ul className="flex flex-wrap justify-center gap-2">
            {recent.map((r) => (
              <li key={r} className="min-w-0 max-w-full">
                <NavLink href={`/${r}`} className="glass block max-w-full truncate rounded-full px-4 py-2 text-sm transition-colors hover:border-white/40">
                  {r}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
