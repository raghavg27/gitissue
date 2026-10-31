import { afterEach, describe, expect, it, vi } from "vitest";
import { safeNextPath, siteUrl } from "./site";

describe("safeNextPath", () => {
  it.each(["/", "/o/r", "/reports?page=2", "/o/r#x"])("keeps the local path %s", (p) => {
    expect(safeNextPath(p)).toBe(p);
  });

  it.each([null, "", "https://evil.example", "//evil.example", "/\\evil.example", "\\\\evil.example", "o/r", "/%0d%0aSet-Cookie:x", "javascript:alert(1)"])(
    "falls back to / for %s",
    (p) => {
      expect(safeNextPath(p)).toBe("/");
    },
  );
});

describe("siteUrl", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("uses NEXT_PUBLIC_APP_URL without a trailing slash", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://gitissue.example/");
    expect(siteUrl()).toBe("https://gitissue.example");
  });

  it("writes the address in one form, so Supabase and the CSP match it", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "httpS://GitIssue.example/");
    expect(siteUrl()).toBe("https://gitissue.example");
  });

  it("uses the deployment URL on a Vercel preview", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://gitissue.example");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_URL", "gitissue-abc.vercel.app");
    expect(siteUrl()).toBe("https://gitissue-abc.vercel.app");
  });

  it("uses this machine in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://gitissue.example");
    expect(siteUrl()).toBe("http://localhost:3000");
  });

  it("falls back to localhost when no address is set", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    expect(siteUrl()).toBe("http://localhost:3000");
  });
});
