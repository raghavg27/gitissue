"use client";

import { useRouter } from "next/navigation";
import { usePageRestore } from "@/hooks/usePageRestore";

// When the user comes back to a page from the back/forward cache, load fresh server data for it.
export function PageRestore() {
  const router = useRouter();
  usePageRestore(() => router.refresh());
  return null;
}
