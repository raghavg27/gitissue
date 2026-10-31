import type { Metadata } from "next";
import { BRAND, REPO_URL } from "./site";

// One builder for page metadata, so no page loses the share defaults. Child metadata replaces
// the parent's openGraph and twitter objects whole, so each page needs the full set.
export function pageMetadata({
  title,
  description,
  path,
  noindex = false,
  absoluteTitle = false,
}: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  absoluteTitle?: boolean;
}): Metadata {
  const shareTitle = absoluteTitle ? title : `${title} · ${BRAND}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    // A noindex page gets no canonical: the two signals contradict each other.
    alternates: noindex ? undefined : { canonical: path },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: { type: "website", siteName: BRAND, locale: "en_US", url: path, title: shareTitle, description },
    twitter: { card: "summary_large_image", title: shareTitle, description },
  };
}

// JSON for a <script type="application/ld+json">. "<" is escaped so no value can close the tag.
export function jsonLdText(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

const context = "https://schema.org";

export const websiteLd = (site: string, description: string) => ({
  "@context": context,
  "@type": "WebSite",
  name: BRAND,
  url: `${site}/`,
  description,
});

export const organizationLd = (site: string) => ({
  "@context": context,
  "@type": "Organization",
  name: BRAND,
  url: `${site}/`,
  logo: `${site}/icons/icon-512.png`,
  sameAs: [REPO_URL],
});

export const webAppLd = (site: string, description: string) => ({
  "@context": context,
  "@type": "WebApplication",
  name: BRAND,
  url: `${site}/`,
  description,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
});

export const webPageLd = (site: string, path: string, name: string, description: string) => ({
  "@context": context,
  "@type": "WebPage",
  name,
  description,
  url: `${site}${path}`,
  isPartOf: { "@type": "WebSite", name: BRAND, url: `${site}/` },
});

export const breadcrumbLd = (site: string, items: { name: string; path: string }[]) => ({
  "@context": context,
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: `${site}${item.path}` })),
});

export const faqLd = (faq: readonly { q: string; a: string }[]) => ({
  "@context": context,
  "@type": "FAQPage",
  mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
});
