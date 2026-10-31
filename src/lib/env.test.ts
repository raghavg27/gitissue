import { afterEach, describe, expect, it, vi } from "vitest";
import { publicEnv, required } from "./env";
import { serverEnv } from "./env.server";

afterEach(() => vi.unstubAllEnvs());

describe("env", () => {
  it("returns a set value", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://x.supabase.co");
    expect(publicEnv.supabaseUrl).toBe("https://x.supabase.co");
  });

  it("names the missing variable and where to set it", () => {
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    expect(() => serverEnv.serviceRoleKey).toThrow(/Missing environment variable SUPABASE_SERVICE_ROLE_KEY\. Set it in \.env\.local/);
  });

  it("treats an empty string as missing", () => {
    expect(() => required("X", "")).toThrow("Missing environment variable X");
  });

  it("has default AI models", () => {
    vi.stubEnv("GROQ_MODEL", "");
    expect(serverEnv.groqModel()).toBe("qwen/qwen3.8-27b");
  });
});
