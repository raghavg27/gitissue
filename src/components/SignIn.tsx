"use client";

import { useState } from "react";
import { usePageRestore } from "@/hooks/usePageRestore";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { ActionButton } from "./ActionButton";

export function SignIn({ next = "/" }: { next?: string }) {
  const [pending, setPending] = useState(false);
  usePageRestore(() => setPending(false));

  async function signIn() {
    setPending(true);
    await createBrowserSupabase().auth.signInWithOAuth({
      provider: "github",
      options: {
        scopes: "repo",
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  return (
    <div className="space-y-6">
      <ActionButton onClick={signIn} busy={pending} busyLabel="Opening GitHub…" className="pill h-14 w-full px-6 text-lg sm:h-16">
        Continue with GitHub
      </ActionButton>
      <div className="space-y-3 text-sm leading-relaxed text-muted">
        <p>
          GitHub will ask for access to your repositories, including private ones. GitIssue needs it to read
          issue templates and code, and to post the issue you approve. Nothing is posted until you tap Post.
        </p>
        <p>
          Drafting runs on Groq, with Google Gemini&apos;s free tier as a backup when Groq fails. When Gemini
          is used, Google may use what is sent, including your description and excerpts of the repo&apos;s code,
          to improve its models.
        </p>
      </div>
    </div>
  );
}
