import { describe, expect, it } from "vitest";
import { cleanText, LIMITS, MAX_IMAGE_BYTES, validateDevice, validateImage, validateIssue, validateText } from "./validation";

describe("cleanText", () => {
  it("removes control characters but keeps new lines and tabs", () => {
    expect(cleanText("a\u0000b\u0007c\n\td\u200b")).toBe("abc\n\td");
  });

  it("trims the ends and normalizes Windows line ends", () => {
    expect(cleanText("  hi\r\nthere  ")).toBe("hi\nthere");
  });
});

describe("validateText", () => {
  it("accepts text inside the limit and returns it cleaned", () => {
    expect(validateText(" it crashes ", "description")).toEqual({ ok: true, value: "it crashes" });
  });

  it("rejects missing, empty and non-string values", () => {
    for (const v of [undefined, "", "   ", 3, null]) {
      expect(validateText(v, "description")).toEqual({ ok: false, error: "Describe the bug first." });
    }
  });

  it("allows an empty optional field", () => {
    expect(validateText("", "appVersion")).toEqual({ ok: true, value: "" });
  });

  it("rejects text over the limit and says the limit", () => {
    const result = validateText("x".repeat(LIMITS.description.max + 1), "description");
    expect(result).toEqual({ ok: false, error: `The description can have up to 5,000 characters.` });
  });
});

describe("validateIssue", () => {
  it("cleans the title, body and labels", () => {
    expect(validateIssue({ title: " Crash ", body: "Steps\u0000", labels: ["bug", " ui ", 4, ""] })).toEqual({
      ok: true,
      value: { title: "Crash", body: "Steps", labels: ["bug", "ui"] },
    });
  });

  it("needs a title only when asked", () => {
    expect(validateIssue({ body: "x" }, { needsTitle: false })).toEqual({ ok: true, value: { title: "", body: "x", labels: [] } });
    expect(validateIssue({ body: "x" })).toEqual({ ok: false, error: "The issue needs a title." });
  });

  it("rejects too many labels", () => {
    const labels = Array.from({ length: LIMITS.labels + 1 }, (_, i) => `l${i}`);
    expect(validateIssue({ title: "t", body: "b", labels })).toEqual({ ok: false, error: "An issue can have up to 10 labels." });
  });
});

describe("validateImage", () => {
  it("accepts common image types and gives the extension", () => {
    expect(validateImage({ type: "image/jpeg", size: 1000 })).toEqual({ ok: true, value: "jpg" });
  });

  it.each([
    [{ type: "image/svg+xml", size: 1000 }, "Only images"],
    [{ type: "text/html", size: 1000 }, "Only images"],
    [{ type: "image/png", size: MAX_IMAGE_BYTES + 1 }, "up to 10 MB"],
    [{ type: "image/png", size: 0 }, "up to 10 MB"],
    [{ type: "image/png" }, "up to 10 MB"],
  ])("rejects %o", (input, text) => {
    const result = validateImage(input);
    expect(result.ok).toBe(false);
    expect(!result.ok && result.error).toContain(text);
  });
});

describe("validateDevice", () => {
  it("accepts a known platform and builds the label", () => {
    expect(validateDevice({ device_model: "Pixel 7", platform: "Android", os_version: "15", app_version: "" })).toEqual({
      ok: true,
      value: { label: "Pixel 7 · Android 15", device_model: "Pixel 7", platform: "Android", os_version: "15", app_version: null },
    });
  });

  it("returns one error per bad field", () => {
    const result = validateDevice({ device_model: "", platform: "Amiga", os_version: "x".repeat(41) });
    expect(result).toEqual({
      ok: false,
      errors: {
        device_model: "Enter the device name.",
        platform: "Pick a platform from the list.",
        os_version: "The OS version can have up to 40 characters.",
      },
    });
  });
});
