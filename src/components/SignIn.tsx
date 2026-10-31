"use client";

import { useState } from "react";
import { usePageRestore } from "@/hooks/usePageRestore";
import { ActionButton } from "./ActionButton";

// A plain form post to /auth/signin, so sign-in works without JavaScript; the script only adds the busy state.
export function SignIn({ next = "/", label = "Continue with GitHub" }: { next?: string; label?: string }) {
  const [pending, setPending] = useState(false);
  usePageRestore(() => setPending(false));

  return (
    <div className="space-y-6">
      <form action="/auth/signin" method="post" onSubmit={() => setPending(true)}>
        <input type="hidden" name="next" value={next} />
        <ActionButton busy={pending} busyLabel="Opening GitHub…" className="pill h-14 w-full px-6 text-lg sm:h-16">
          {label}
        </ActionButton>
      </form>
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
