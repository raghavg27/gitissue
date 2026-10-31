"use client";

import { useEffect, useRef } from "react";

// Runs when the browser shows this page again from the back/forward cache, so a spinner left on can be reset.
export function usePageRestore(onRestore: () => void) {
  const callback = useRef(onRestore);
  useEffect(() => {
    callback.current = onRestore;
  });
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => e.persisted && callback.current();
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);
}
