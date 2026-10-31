"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const FIELDS = ["INPUT", "TEXTAREA", "SELECT"];

// A link such as /#repo puts the cursor in that field, not only scrolls to it.
export function HashFocus() {
  const pathname = usePathname();
  useEffect(() => {
    function focusTarget() {
      const id = decodeURIComponent(location.hash.slice(1));
      const el = id && document.getElementById(id);
      if (el && FIELDS.includes(el.tagName)) el.focus();
    }
    focusTarget();
    window.addEventListener("hashchange", focusTarget);
    return () => window.removeEventListener("hashchange", focusTarget);
  }, [pathname]);
  return null;
}
