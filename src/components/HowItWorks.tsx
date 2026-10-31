import { COMPARISON, STEPS } from "@/content/how-it-works";

// The three steps, as numbered cards.
export function Steps({ headingLevel: H = "h3" }: { headingLevel?: "h2" | "h3" }) {
  return (
    <ol className="grid gap-3 sm:grid-cols-3">
      {STEPS.map((s, i) => (
        <li key={s.title} className="glass space-y-3 rounded-3xl p-6 text-left">
          <span aria-hidden className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-[#ffc46b] to-[#ff7a4d] text-sm font-medium text-pill-ink">{i + 1}</span>
          <H className="text-lg font-medium">
            <span className="sr-only">Step {i + 1}: </span>
            {s.title}
          </H>
          <p className="text-muted">{s.text}</p>
        </li>
      ))}
    </ol>
  );
}

// By hand compared with GitIssue. Rows on wide screens, cards on phones.
export function Comparison() {
  return (
    <div className="glass overflow-hidden rounded-3xl text-left">
      <div aria-hidden className="hidden grid-cols-[9rem_1fr_1fr] gap-6 border-b border-line px-6 py-4 text-sm text-muted sm:grid">
        <span />
        <span>By hand</span>
        <span className="text-ink">With GitIssue</span>
      </div>
      <dl className="divide-y divide-line">
        {COMPARISON.map((row) => (
          <div key={row.topic} className="grid gap-2 px-6 py-5 sm:grid-cols-[9rem_1fr_1fr] sm:gap-6">
            <dt className="font-medium">{row.topic}</dt>
            <dd className="text-muted">
              <span className="block text-xs sm:sr-only">By hand</span>
              {row.manual}
            </dd>
            <dd>
              <span className="block text-xs text-muted sm:sr-only">With GitIssue</span>
              {row.gitissue}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
