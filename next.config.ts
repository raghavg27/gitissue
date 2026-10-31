import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
