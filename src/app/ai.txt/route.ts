import { aiTxt, textResponse } from "@/lib/ai-text";

export const dynamic = "force-static";

export function GET() {
  return textResponse(aiTxt());
}
