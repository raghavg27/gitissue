import type { MetadataRoute } from "next";
import { PUBLIC_PAGES } from "@/content/pages";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = siteUrl();
  return PUBLIC_PAGES.map((page) => ({
    url: `${site}${page.path === "/" ? "" : page.path}`,
    lastModified: new Date(page.updated),
    changeFrequency: "monthly",
    priority: page.path === "/" ? 1 : 0.7,
  }));
}
