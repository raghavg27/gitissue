import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GitIssue",
    short_name: "GitIssue",
    description: "Say the bug out loud. Get a GitHub issue that fits the repo.",
    start_url: "/",
    display: "standalone",
    background_color: "#04050c",
    theme_color: "#04050c",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
