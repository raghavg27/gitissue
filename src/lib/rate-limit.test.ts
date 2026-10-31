import { describe, expect, it } from "vitest";
import { limitMessage, rateKey } from "./rate-limit";

describe("rateKey", () => {
  it("is a stable hash that does not contain the subject", () => {
    const key = rateKey("secret", "post", "network", "203.0.113.7");
    expect(key).toMatch(/^[0-9a-f]{64}$/);
    expect(key).toBe(rateKey("secret", "post", "network", "203.0.113.7"));
    expect(key).not.toContain("203.0.113.7");
  });

  it("changes with the secret, the action and the kind", () => {
    const base = rateKey("secret", "post", "user", "u1");
    expect(rateKey("other", "post", "user", "u1")).not.toBe(base);
    expect(rateKey("secret", "draft", "user", "u1")).not.toBe(base);
    expect(rateKey("secret", "post", "device", "u1")).not.toBe(base);
  });
});

describe("limitMessage", () => {
  it("says the limit and when it resets, in plain words", () => {
    expect(limitMessage("draft", 30, 3 * 60 * 60)).toBe(
      "You reached the limit of 30 AI drafts per hour. Resets in 3 hours. Your draft is saved on this device.",
    );
    expect(limitMessage("post", 1, 90)).toBe("You reached the limit of 1 post per hour. Resets in 2 minutes. Your draft is saved on this device.");
  });
});
