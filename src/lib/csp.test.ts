import { describe, expect, it } from "vitest";
import { buildCsp } from "./csp";

const csp = (dev: boolean) => buildCsp({ nonce: "abc123", dev, supabaseUrl: "https://ref.supabase.co", appUrl: "https://app.example/" });

describe("buildCsp", () => {
  it("allows scripts only with the nonce, and blocks framing and plugins", () => {
    const policy = csp(false);
    expect(policy).toContain("script-src 'self' 'nonce-abc123' 'strict-dynamic'");
    expect(policy).not.toContain("unsafe-eval");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("upgrade-insecure-requests");
  });

  it("allows images and uploads only from the project's own Supabase origin", () => {
    expect(csp(false)).toContain("img-src 'self' data: blob: https://ref.supabase.co;");
    expect(csp(false)).toContain("connect-src 'self' https://ref.supabase.co;");
  });

  it("lets sign-in redirect through Supabase and GitHub back to the app", () => {
    expect(csp(false)).toContain("form-action 'self' https://app.example https://ref.supabase.co https://github.com;");
  });

  it("adds unsafe-eval and drops the https upgrade in development", () => {
    expect(csp(true)).toContain("'strict-dynamic' 'unsafe-eval'");
    expect(csp(true)).not.toContain("upgrade-insecure-requests");
  });
});
