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
        <SmoothScroll />
        <PageRestore />
        <HashFocus />
        {children}
      </body>
    </html>
  );
}
