import { Fragment } from "react";
import { AppHeader } from "./AppHeader";
import { Backdrop } from "./Backdrop";

type Vars = React.CSSProperties & Record<`--${string}`, string>;

// Splits text into words that rise in one after another.
function Words({ text, start, stagger, dur, rise }: { text: string; start: number; stagger: number; dur: number; rise: number }) {
  return text.split(" ").map((word, i) => (
    <Fragment key={i}>
      {i > 0 && " "}
      <span
        className="reveal-word"
        style={{ "--delay": `${start + i * stagger}ms`, "--dur": `${dur}ms`, "--rise": `${rise}px` } as Vars}
      >
        {word}
      </span>
    </Fragment>
  ));
}

// Full-screen entrance used by the home and sign-in screens, over the live ink.
export function Hero({
  signedIn,
  badge,
  title,
  sub,
  children,
}: {
  signedIn: boolean;
  badge: string;
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <Backdrop live />
      <AppHeader signedIn={signedIn} reveal />
      <main id="main" tabIndex={-1} className="flex flex-1 flex-col items-center justify-center px-5 py-10 text-center sm:px-10">
        <div className="flex w-full max-w-[22rem] flex-col items-center sm:max-w-[40rem] lg:max-w-[52rem]">
          <p
            className="glass reveal inline-flex max-w-full items-center rounded-full px-3.5 py-1.5 text-[0.72rem] text-muted [overflow-wrap:anywhere] sm:text-[0.8rem]"
            style={{ "--delay": "320ms" } as Vars}
          >
            {badge}
          </p>
          <h1 className="mt-5 max-w-[20rem] text-[2rem] text-balance leading-[1.1] font-medium tracking-[-0.02em] sm:mt-7 sm:max-w-[34rem] sm:text-[3.5rem] lg:max-w-[46rem] lg:text-[5rem]">
            <Words text={title} start={480} stagger={85} dur={720} rise={26} />
          </h1>
          <p className="mt-4 max-w-[20rem] text-base leading-normal text-muted sm:mt-5 sm:max-w-[34rem] sm:text-[1.1rem] lg:max-w-[40rem] lg:text-[1.2rem]">
            <Words text={sub} start={1150} stagger={22} dur={600} rise={14} />
          </p>
          <div className="reveal mt-7 w-full max-w-[37rem] sm:mt-10" style={{ "--delay": "1450ms" } as Vars}>
            {children}
          </div>
        </div>
      </main>
      <footer
        className="reveal px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center text-[0.72rem] text-muted sm:px-10 sm:pb-6 sm:text-[0.8rem]"
        style={{ "--delay": "1650ms" } as Vars}
      >
        Nothing is posted to GitHub until you tap Post.
      </footer>
    </div>
  );
}
