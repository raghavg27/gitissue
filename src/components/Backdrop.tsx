"use client";

import { useEffect, useRef } from "react";

// Ink-in-water background. Live on the home and sign-in screens; calm (slow, dim, no pointer) on working screens.
export function Backdrop({ live = false }: { live?: boolean }) {
  const holder = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // A fresh canvas per mount: destroy() frees its GPU context, which can't be reused afterwards.
    const canvas = document.createElement("canvas");
    canvas.className = `h-full w-full ${live ? "" : "opacity-60"}`;
    holder.current!.prepend(canvas);
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let destroy: (() => void) | undefined;
    let gone = false;
    // The WebGL code loads after the page is interactive, in its own chunk.
    import("@/lib/fluid")
      .then(({ fluidSimulation }) => {
        if (!gone) destroy = fluidSimulation(canvas, { calm: !live, still });
      })
      .catch(() => {
        // No WebGL: the base colour behind the canvas is enough.
      });
    return () => {
      gone = true;
      destroy?.();
      canvas.remove();
    };
  }, [live]);

  return (
    <div ref={holder} aria-hidden className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-lvh">
      <div className={`absolute inset-0 ${live ? "scrim" : "scrim-calm"}`} />
    </div>
  );
}
