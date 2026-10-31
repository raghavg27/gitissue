"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export function SignIn({ next = "/" }: { next?: string }) {
  const [pending, setPending] = useState(false);

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
      <button onClick={signIn} disabled={pending} className="pill h-14 w-full px-6 text-lg sm:h-16">
        {pending ? "Opening GitHub…" : "Continue with GitHub"}
      </button>
      <div className="space-y-3 text-sm leading-relaxed text-muted">
        <p>
          GitHub will ask for access to your repositories, including private ones. GitIssue needs it to read
          issue templates and code, and to post the issue you approve. Nothing is posted until you tap Post.
        </p>
        <p>
          Drafting runs on Google Gemini&apos;s free tier. Google may use what&apos;s sent, including your
          description and excerpts of the repo&apos;s code, to improve its models.
        </p>
      </div>
    </div>
  );
}
