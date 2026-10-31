"use client";

import { useEffect, useState } from "react";
import { loadDraft, saveDraft } from "@/lib/drafts";
import { LIMITS } from "@/lib/validation";
import { MicButton } from "./MicButton";
import { SignIn } from "./SignIn";

// Lets a visitor describe the bug before they make an account. The text waits on this device until they sign in.
export function DraftBeforeSignIn({ repo }: { repo: string }) {
  const [description, setDescription] = useState("");

  useEffect(() => {
    const saved = loadDraft<{ description: string }>(repo).description;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of device storage after hydration
    if (typeof saved === "string") setDescription(saved);
  }, [repo]);

  function change(text: string) {
    setDescription(text);
    saveDraft(repo, { ...loadDraft(repo), description: text });
  }

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-2">
        <label htmlFor="description" className="block font-medium">What went wrong?</label>
        <div className="flex items-start gap-3">
          <textarea
            id="description"
            value={description}
            maxLength={LIMITS.description.max}
            aria-describedby="description-hint"
            onChange={(e) => change(e.target.value)}
            rows={5}
            placeholder="Say it the way you would tell the developer: what you did, what you expected, what happened instead."
            className="glass min-w-0 flex-1 rounded-3xl px-5 py-4 text-lg leading-relaxed"
          />
          <MicButton onText={(t) => change(description.trim() ? `${description.trimEnd()} ${t}` : t)} />
        </div>
        <p id="description-hint" className="text-sm text-muted">Your text stays on this device until you sign in.</p>
      </div>
      <SignIn next={`/${repo}`} label="Continue with GitHub to draft" />
    </div>
  );
}
