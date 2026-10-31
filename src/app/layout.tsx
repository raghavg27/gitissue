import type { Metadata, Viewport } from "next";
import { Onest } from "next/font/google";
import { HashFocus } from "@/components/HashFocus";
import { PageRestore } from "@/components/PageRestore";
import { SmoothScroll } from "@/components/SmoothScroll";
import "./globals.css";

const body = Onest({ variable: "--font-body", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GitIssue",
  description: "Say the bug out loud. Get an issue that fits the repo.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#04050c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${body.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-pill focus:px-5 focus:py-3 focus:font-medium focus:text-pill-ink"
        >
          Skip to content
        </a>
        <SmoothScroll />
        <PageRestore />
        <HashFocus />
        {children}
      </body>
    </html>
  );
}
