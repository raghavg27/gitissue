import { jsonLdText } from "@/lib/seo";

// Structured data for search engines. It is data, not script, so it runs nowhere.
export function JsonLd({ data }: { data: object | object[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdText(data) }} />;
}
