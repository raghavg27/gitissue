import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import { Onest } from "next/font/google";
import { HashFocus } from "@/components/HashFocus";
import { PageRestore } from "@/components/PageRestore";
import { SmoothScroll } from "@/components/SmoothScroll";
import { BRAND, siteUrl } from "@/lib/site";
import "./globals.css";

// Self-hosted by next/font; text shows at once in a fallback font while Onest loads.
const body = Onest({ variable: "--font-body", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: BRAND, template: `%s · ${BRAND}` },
  description: "Say the bug out loud. Get a GitHub issue that fits the repo.",
  applicationName: BRAND,
  // Preview deployments are never indexed; robots.txt blocks them too.
  robots: process.env.VERCEL_ENV === "preview" ? { index: false, follow: false } : undefined,
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#04050c",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Each page is rendered per request, so its scripts carry that request's CSP nonce.
  await connection();
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
        {/* Cookieless, and served from this site's own /_vercel path, so no cookie banner is needed. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
