"use client";

import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore, useTransition } from "react";
import { usePageRestore } from "@/hooks/usePageRestore";
import { readRecentRepos } from "@/lib/recent-repos";
import { parseRepoUrl } from "@/lib/repo-url";
import { ActionButton } from "./ActionButton";
import { NavLink } from "./NavLink";

const noSubscribe = () => () => {};
const appHost = process.env.NEXT_PUBLIC_APP_URL && new URL(process.env.NEXT_PUBLIC_APP_URL).host;

export function RepoPicker() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [opening, startOpening] = useTransition();
  usePageRestore(() => setError(""));
  const recent = useSyncExternalStore(noSubscribe, () => readRecentRepos().join("\n"), () => "")
    .split("\n")
    .filter(Boolean);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const ref = parseRepoUrl(value);
    if (!ref) return setError("That doesn't look like a GitHub repo. Paste a link like github.com/owner/repo.");
    startOpening(() => router.push(`/${ref.owner}/${ref.repo}`));
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="space-y-3">
        <label htmlFor="repo" className="sr-only">
          Which repo are you testing?
        </label>
        <div className="glass flex h-14 items-center rounded-full pr-1.5 pl-5 shadow-sm focus-within:border-white/40 sm:h-16 sm:pl-6">
          <input
            id="repo"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError("");
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
        {error && <p className="text-sm text-rec">{error}</p>}
        {appHost && (
          <p className="text-sm text-muted">
            Shortcut: on any GitHub repo page, replace <code className="text-ink">github.com</code> with{" "}
            <code className="whitespace-nowrap text-ink">{appHost}</code> in the address bar.
          </p>
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
