import { describe, expect, it } from "vitest";
import type { RepoContext } from "@/lib/context/gather";
import type { IssueCandidate } from "@/lib/types";
import { buildAnalyzePrompt, fallbackDraft, groundNames, parseAnalyzeResponse, parseDraft } from "./draft";

const ctx: RepoContext = {
  template: null,
  recentIssues: [{ number: 3, title: "[Bug] Home crashes", labels: ["bug", "android"] }],
  screenFiles: ["src/screens/LoginScreen.tsx", "src/screens/HomeScreen.tsx"],
  codeSnippets: [{ path: "src/navigation/AppNavigator.tsx", text: '<Stack.Screen name="OtpVerify" />' }],
  missing: [],
  sha: "abc",
};

const candidates: IssueCandidate[] = [
  { number: 7, title: "Blank screen after login", state: "closed", url: "https://github.com/o/r/issues/7", authorLogin: "dev", body: "" },
  { number: 9, title: "Typo on settings", state: "open", url: "https://github.com/o/r/issues/9", authorLogin: "qa", body: "" },
];

const good = {
  duplicates: [
    { number: 7, reason: "Same blank screen right after login" },
    { number: 42, reason: "hallucinated" },
  ],
  title: "Blank Home after OTP",
  body: "### Summary\nBlank",
  labels: ["bug", "made-up-label"],
  screenNames: ["LoginScreen", "OtpVerify", "CheckoutScreen"],
  missingFields: ["App version"],
  environment: { platform: "Android", osVersion: "14", device: "Pixel 7" },
};

describe("groundNames", () => {
  it("keeps only names present in the scanned corpus", () => {
    expect(groundNames(["LoginScreen", "CheckoutScreen", "otpverify"], "src/screens/LoginScreen.tsx OtpVerify")).toEqual([
      "LoginScreen",
      "otpverify",
    ]);
  });
});

describe("parseAnalyzeResponse", () => {
  it("throws on garbage so the caller can fall back", () => {
    expect(() => parseAnalyzeResponse("nope", ctx, candidates)).toThrow();
    expect(() => parseAnalyzeResponse({ title: 1 }, ctx, candidates)).toThrow();
  });

  it("drops unknown duplicates, ungrounded names and unknown labels", () => {
    const { draft, duplicates } = parseAnalyzeResponse(good, ctx, candidates);
    expect(duplicates).toEqual([
      {
        number: 7,
        title: "Blank screen after login",
        state: "closed",
        url: "https://github.com/o/r/issues/7",
        authorLogin: "dev",
        reason: "Same blank screen right after login",
      },
    ]);
    expect(draft.screenNames).toEqual(["LoginScreen", "OtpVerify"]);
    expect(draft.labels).toEqual(["bug"]);
    expect(draft.missingFields).toEqual(["App version"]);
    expect(draft.environment.device).toBe("Pixel 7");
  });

  it("caps duplicates at 5", () => {
    const many = Array.from({ length: 8 }, (_, i) => ({ ...candidates[0], number: i + 1 }));
    const raw = { ...good, duplicates: many.map((c) => ({ number: c.number, reason: "r" })) };
    expect(parseAnalyzeResponse(raw, ctx, many).duplicates).toHaveLength(5);
  });
});

describe("parseDraft", () => {
  it("defaults optional arrays", () => {
    const d = parseDraft({ title: "t", body: "b" }, ctx);
    expect(d).toEqual({ title: "t", body: "b", labels: [], screenNames: [], missingFields: [], environment: {} });
  });
});

describe("fallbackDraft", () => {
  it("uses the default structure without a template", () => {
    const d = fallbackDraft("It crashes", null);
    for (const h of ["Summary", "Steps to Reproduce", "Expected", "Actual", "Environment", "Screenshots", "Additional context"]) {
      expect(d.body).toContain(`### ${h}`);
    }
    expect(d.body).toMatch(/### Summary\n\nIt crashes/);
  });

  it("uses form sections and flags required ones", () => {
    const d = fallbackDraft("It crashes", {
      name: "Bug",
      title: "[Bug]: ",
      labels: ["bug"],
      kind: "form",
      sections: [
        { label: "What happened?", required: true },
        { label: "Version", required: true },
        { label: "Logs", required: false },
      ],
    });
    expect(d.title).toBe("[Bug]: ");
    expect(d.body).toMatch(/### What happened\?\n\nIt crashes/);
    expect(d.missingFields).toEqual(["Version"]);
    expect(d.labels).toEqual(["bug"]);
  });
});

describe("buildAnalyzePrompt", () => {
  it("includes dictation, device, screen files and candidates", () => {
    const p = buildAnalyzePrompt({
      description: "blank after login",
      device: { label: "Pixel", platform: "Android", os_version: "14", device_model: "Pixel 7", app_version: null },
      ctx,
      candidates,
    });
    expect(p).toContain("blank after login");
    expect(p).toContain("Pixel 7");
    expect(p).toContain("src/screens/LoginScreen.tsx");
    expect(p).toContain("#7");
  });
});
