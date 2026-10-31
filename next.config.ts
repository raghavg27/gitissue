import type { NextConfig } from "next";

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // No site may frame GitIssue. X-Frame-Options covers older browsers.
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // The microphone is for dictation on this site only; nothing else is used.
  { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(), payment=(), usb=(), browsing-topics=()" },
  // Preview deployments must never be indexed.
  ...(process.env.VERCEL_ENV === "preview" ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Every client gets metadata in the <head>, not streamed later in the body, so all crawlers read it.
  htmlLimitedBots: /.*/,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Icons and the manifest change rarely; share cards are built once per deployment.
      { source: "/icons/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] },
      { source: "/manifest.webmanifest", headers: [{ key: "Cache-Control", value: "public, max-age=86400" }] },
      { source: "/:path*/(opengraph-image|twitter-image)", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] },
      { source: "/(opengraph-image|twitter-image)", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] },
      // API answers are per user and must never be cached by a browser or CDN.
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "private, no-store" }] },
    ];
  },
  async redirects() {
    return [{ source: "/settings", destination: "/devices", permanent: true }];
  },
};

export default nextConfig;
