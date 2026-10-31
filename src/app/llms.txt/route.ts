import { llmsTxt, textResponse } from "@/lib/ai-text";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  return textResponse(llmsTxt(siteUrl()));
}
