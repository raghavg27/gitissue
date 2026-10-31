import { describe, expect, it } from "vitest";
import { breadcrumbLd, faqLd, jsonLdText, pageMetadata } from "./seo";

describe("pageMetadata", () => {
  it("gives an indexable page a canonical URL and full share tags", () => {
    const m = pageMetadata({ title: "Features", description: "What it does.", path: "/features" });
    expect(m.title).toBe("Features");
    expect(m.alternates).toEqual({ canonical: "/features" });
    expect(m.robots).toBeUndefined();
    expect(m.openGraph).toMatchObject({
      type: "website",
      siteName: "GitIssue",
      locale: "en_US",
      url: "/features",
      title: "Features · GitIssue",
      description: "What it does.",
    });
    expect(m.twitter).toMatchObject({ card: "summary_large_image", title: "Features · GitIssue", description: "What it does." });
  });

  it("does not add the brand twice to an absolute title", () => {
    const m = pageMetadata({ title: "GitIssue · Say the bug out loud", description: "d", path: "/", absoluteTitle: true });
    expect(m.title).toEqual({ absolute: "GitIssue · Say the bug out loud" });
    expect(m.openGraph?.title).toBe("GitIssue · Say the bug out loud");
  });

  it("marks a private page noindex and leaves out the canonical", () => {
    const m = pageMetadata({ title: "My reports", description: "d", path: "/reports", noindex: true });
    expect(m.robots).toEqual({ index: false, follow: false });
    expect(m.alternates).toBeUndefined();
  });
});

describe("jsonLdText", () => {
  it("escapes < so a value cannot close the script tag", () => {
    const text = jsonLdText({ name: "</script><script>alert(1)</script>" });
    expect(text).not.toContain("<");
    expect(JSON.parse(text)).toEqual({ name: "</script><script>alert(1)</script>" });
  });
});

describe("structured data", () => {
  it("builds a breadcrumb list with absolute URLs", () => {
    expect(breadcrumbLd("https://x.test", [{ name: "Home", path: "/" }, { name: "Features", path: "/features" }])).toEqual({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://x.test/" },
        { "@type": "ListItem", position: 2, name: "Features", item: "https://x.test/features" },
      ],
    });
  });

  it("builds an FAQ page", () => {
    expect(faqLd([{ q: "Q?", a: "A." }])).toEqual({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [{ "@type": "Question", name: "Q?", acceptedAnswer: { "@type": "Answer", text: "A." } }],
    });
  });
});
