"use client";

import { ProblemPage } from "@/components/ProblemPage";

export default function Error({ retry }: { error: unknown; retry: () => void }) {
  return (
    <ProblemPage
      title="Something went wrong"
      line="This page could not load. Check your internet and try again."
      action={<button onClick={() => retry()} className="pill h-12 px-6">Try again</button>}
    />
  );
}
