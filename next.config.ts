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
  async redirects() {
    return [{ source: "/settings", destination: "/devices", permanent: true }];
  },
};

export default nextConfig;
