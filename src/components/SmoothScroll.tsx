"use client";

import Lenis from "lenis";
import { useEffect } from "react";

// Smooth mouse-wheel scrolling. Touch scrolling stays native; text areas keep their own scroll.
export function SmoothScroll() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ smoothWheel: true, autoRaf: true, allowNestedScroll: true });
    return () => lenis.destroy();
  }, []);
  return null;
}
