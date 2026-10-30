"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { readRecentRepos } from "@/lib/recent-repos";
import { parseRepoUrl } from "@/lib/repo-url";

const noSubscribe = () => () => {};

export function RepoPicker() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const recent = useSyncExternalStore(noSubscribe, () => readRecentRepos().join("\n"), () => "")
    .split("\n")
    .filter(Boolean);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const ref = parseRepoUrl(value);
    if (!ref) return setError("That doesn't look like a GitHub repo. Paste a link like github.com/owner/repo.");
    router.push(`/${ref.owner}/${ref.repo}`);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="space-y-3">
        <label htmlFor="repo" className="block font-bold">
          Which repo are you testing?
        </label>
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
          className="w-full rounded-xl border border-line bg-card px-4 py-3 text-lg"
        />
        {error && <p className="text-sm text-rec">{error}</p>}
        <button className="w-full rounded-xl bg-ink px-5 py-4 text-lg font-bold text-paper">Open repo</button>
      </form>
      {recent.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm text-muted">Recent</h2>
          <ul className="divide-y divide-line rounded-xl border border-line bg-card">
            {recent.map((r) => (
              <li key={r}>
                <Link href={`/${r}`} className="block px-4 py-3 font-bold">
                  {r}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
