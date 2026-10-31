"use client";

import { useEffect } from "react";

// Smooth mouse-wheel scrolling. Touch scrolling stays native; text areas keep their own scroll.
export function SmoothScroll() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let lenis: { destroy(): void } | undefined;
    let gone = false;
    // Loads only where it runs: not for reduced motion, and never in the first bundle.
    import("lenis").then(({ default: Lenis }) => {
      if (!gone) lenis = new Lenis({ smoothWheel: true, autoRaf: true, allowNestedScroll: true });
    });
    return () => {
      gone = true;
      lenis?.destroy();
    };
  }, []);
  return null;
}
