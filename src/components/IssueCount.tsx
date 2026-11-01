"use client";

import { createContext, use } from "react";
import { plural } from "@/lib/format";

const IssueCountContext = createContext<number | null>(null);

// The root layout reads the count once, so every nav bar can show it, the error page too.
export function IssueCountProvider({ count, children }: { count: number | null; children: React.ReactNode }) {
  return <IssueCountContext value={count}>{children}</IssueCountContext>;
}

// Nav bar chip (issue #11). Phones show the short form; screen readers always hear the full line.
export function IssueCountChip() {
  const count = use(IssueCountContext);
  if (count === null) return null;
  return (
    <p className="glass inline-flex h-8 items-center rounded-full px-3 text-[0.75rem] whitespace-nowrap text-muted sm:h-10 sm:px-4 sm:text-[0.85rem]">
      {plural(count, "issue")}
      <span className="sr-only sm:not-sr-only">&nbsp;created</span>
      <span className="sr-only"> with GitIssue</span>
    </p>
  );
}
