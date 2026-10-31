"use client";

import { useState } from "react";
import { usePageRestore } from "@/hooks/usePageRestore";
import { ActionButton } from "./ActionButton";

// A plain form post, so sign-out also works without JavaScript; the script only adds the busy state.
export function SignOutButton({ className }: { className?: string }) {
  const [pending, setPending] = useState(false);
  usePageRestore(() => setPending(false));
  return (
    <form action="/auth/signout" method="post" onSubmit={() => setPending(true)} className="contents">
      <ActionButton busy={pending} busyLabel="Signing out…" className={className}>
        Sign out
      </ActionButton>
    </form>
  );
}
