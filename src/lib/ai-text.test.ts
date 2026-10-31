import { describe, expect, it } from "vitest";
import { aiTxt, llmsFullTxt, llmsTxt } from "./ai-text";

describe("AI text files", () => {
  it("llms.txt starts with the title and a summary, and lists public pages", () => {
    const text = llmsTxt("https://x.test");
    expect(text.startsWith("# GitIssue\n\n> ")).toBe(true);
    expect(text).toContain("- [Features](https://x.test/features)");
    expect(text).toContain("(https://github.com/raghavg27/gitissue)");
  });

  it("llms-full.txt has every feature and question", () => {
    const text = llmsFullTxt("https://x.test");
    expect(text).toContain("### Say the bug out loud");
    expect(text).toContain("### Does GitIssue post anything without me?");
  });

  it("ai.txt blocks the private paths", () => {
    expect(aiTxt()).toContain("Disallow: /api/");
  });
});
