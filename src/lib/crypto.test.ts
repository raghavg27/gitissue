import { randomBytes } from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";
import { decryptToken, encryptToken } from "./crypto";

beforeAll(() => {
  process.env.TOKEN_ENCRYPTION_KEY = randomBytes(32).toString("base64");
});

describe("token crypto", () => {
  it("round-trips", () => {
    expect(decryptToken(encryptToken("gho_abc123"))).toBe("gho_abc123");
  });

  it("uses a fresh IV each time", () => {
    expect(encryptToken("same")).not.toBe(encryptToken("same"));
  });

  it("rejects tampered ciphertext", () => {
    const [iv, tag, data] = encryptToken("gho_abc123").split(".");
    const flipped = Buffer.from(data, "base64");
    flipped[0] ^= 1;
    expect(() => decryptToken([iv, tag, flipped.toString("base64")].join("."))).toThrow();
  });
});
