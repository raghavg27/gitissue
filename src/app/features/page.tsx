import Link from "next/link";
import { ContentPage } from "@/components/ContentPage";
import { FAQ, FEATURES } from "@/content/features";

export default function Features() {
  return (
    <ContentPage title="Features" intro="Each thing GitIssue does, and the reason it does it.">
      <ul className="space-y-3">
        {FEATURES.map((f) => (
          <li key={f.name} className="glass space-y-2 rounded-3xl p-5">
            <h2 className="text-lg font-medium">{f.name}</h2>
            <p>{f.what}</p>
            <p className="text-muted">
              <span className="font-medium text-ink">Why: </span>
              {f.why}
            </p>
          </li>
        ))}
      </ul>
      <section aria-labelledby="faq" className="space-y-3">
        <h2 id="faq" className="text-2xl font-medium tracking-tight">Questions</h2>
        {FAQ.map((item) => (
          <details key={item.q} className="glass group rounded-3xl px-5 py-4">
            <summary className="cursor-pointer font-medium">{item.q}</summary>
            <p className="mt-2 text-muted">{item.a}</p>
          </details>
        ))}
      </section>
      <Link href="/#repo" className="pill h-12 px-6">Report a bug</Link>
    </ContentPage>
  );
}
