import type { MetadataRoute } from "next";
import { PRIVATE_PATHS } from "@/content/pages";
import { siteUrl } from "@/lib/site";

// AI crawlers named here may read the public pages, the same as search engines.
const AI_CRAWLERS = ["GPTBot", "OAI-SearchBot", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended", "Applebot-Extended", "CCBot"];

export default function robots(): MetadataRoute.Robots {
  // Preview deployments are copies of the site and must never be crawled.
  if (process.env.VERCEL_ENV === "preview") return { rules: { userAgent: "*", disallow: "/" } };
  const rule = {
    allow: ["/", "/opengraph-image", "/twitter-image", "/*/opengraph-image", "/*/twitter-image"],
    disallow: PRIVATE_PATHS,
  };
  const site = siteUrl();
  return {
    rules: [
      { userAgent: "*", ...rule },
      { userAgent: AI_CRAWLERS, ...rule },
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
