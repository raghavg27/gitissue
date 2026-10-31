import Link from "next/link";
import { FAQ } from "@/content/features";
import { FaqList } from "./FaqList";
import { Comparison, Steps } from "./HowItWorks";

const section = "mx-auto w-full max-w-5xl space-y-6 px-5 sm:px-10";
const heading = "text-3xl font-medium tracking-tight text-balance sm:text-4xl";
const eyebrow = "text-sm font-medium tracking-wide text-pill uppercase";

// The home page story under the first screen: the steps, why it beats the usual way, questions, and one last call.
export function HomeSections() {
  return (
    <div className="space-y-24 py-20 sm:space-y-32 sm:py-28">
      <section aria-labelledby="how" className={section}>
        <div className="space-y-2">
          <p className={eyebrow}>How it works</p>
          <h2 id="how" className={heading}>From a bug you found to an issue in about a minute</h2>
        </div>
        <Steps />
      </section>

      <section aria-labelledby="why" className={section}>
        <div className="space-y-2">
          <p className={eyebrow}>Why GitIssue</p>
          <h2 id="why" className={heading}>Less typing for you. Fewer questions for the developer.</h2>
          <p className="max-w-2xl text-lg text-muted">
            A good bug report gets fixed. A vague one waits, and a bug that nobody reports stays for the next person.
          </p>
        </div>
        <Comparison />
      </section>

      <section aria-labelledby="questions" className={section}>
        <div className="space-y-2">
          <p className={eyebrow}>Questions</p>
          <h2 id="questions" className={heading}>Before you start</h2>
        </div>
        <FaqList items={FAQ.slice(0, 3)} />
        <Link href="/faq" className="inline-block font-medium underline underline-offset-4">See all questions</Link>
      </section>

      <section aria-labelledby="start" className={section}>
        <div className="glass space-y-5 rounded-3xl px-6 py-12 text-center sm:px-12">
          <h2 id="start" className={heading}>Found a bug? Report it while you remember it.</h2>
          <p className="mx-auto max-w-xl text-lg text-muted">No account is needed to start. Paste a repo link and say what went wrong.</p>
          <Link href="/#repo" className="pill h-14 px-8 text-lg">Report a bug</Link>
        </div>
      </section>
    </div>
  );
}
