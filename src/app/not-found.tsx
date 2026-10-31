import type { Metadata } from "next";
import { ProblemPage } from "@/components/ProblemPage";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return <ProblemPage title="Page not found" line="This page does not exist. Check the address, or start from the home page." />;
}
