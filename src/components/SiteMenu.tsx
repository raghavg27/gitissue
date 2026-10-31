"use client";

import { useRef } from "react";
import { SITE_LINKS } from "@/content/pages";
import { NavLink } from "./NavLink";

// Phones only: the public page links open from a menu button, and the menu closes when a link is tapped.
export function SiteMenu() {
  const menu = useRef<HTMLDetailsElement>(null);
  return (
    <details ref={menu} className="relative sm:hidden">
      <summary
        aria-label="Menu"
        className="glass flex h-10 w-10 list-none items-center justify-center rounded-full [&::-webkit-details-marker]:hidden"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden className="h-5 w-5">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </summary>
      <nav
        aria-label="Site"
        onClick={() => menu.current?.removeAttribute("open")}
        className="absolute top-12 right-0 flex w-48 flex-col rounded-2xl border border-line bg-paper/95 p-2 shadow-lg backdrop-blur-xl"
      >
        {SITE_LINKS.map((l) => (
          <NavLink key={l.href} href={l.href} className="rounded-xl px-4 py-3 text-muted transition-colors hover:bg-card hover:text-ink aria-[current=page]:text-ink">
            {l.label}
          </NavLink>
        ))}
      </nav>
    </details>
  );
}
