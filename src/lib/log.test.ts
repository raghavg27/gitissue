import { describe, expect, it } from "vitest";
import { safeError } from "./log";

describe("safeError", () => {
  it("keeps the name, message and status only", () => {
    const e = Object.assign(new Error("Not Found"), { status: 404, request: { headers: { authorization: "token secret" } } });
    expect(safeError(e)).toEqual({ name: "Error", message: "Not Found", status: 404 });
  });

  it("hides email addresses and cuts long messages", () => {
    const result = safeError(new Error(`user a.b@example.com failed ${"x".repeat(300)}`));
    expect(result.message).not.toContain("example.com");
    expect(result.message.length).toBe(200);
  });

  it("handles values that are not errors", () => {
    expect(safeError("boom")).toEqual({ name: "Error", message: "boom", status: undefined });
  });
});
