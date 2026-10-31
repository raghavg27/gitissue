import { describe, expect, it } from "vitest";
import { plural, resetsIn } from "./format";

describe("plural", () => {
  it.each([
    [0, "0 reports"],
    [1, "1 report"],
    [2, "2 reports"],
    [1200, "1,200 reports"],
  ])("%i", (n, text) => {
    expect(plural(n, "report")).toBe(text);
  });

  it("uses a given plural form", () => {
    expect(plural(1, "match", "matches")).toBe("1 match");
    expect(plural(3, "match", "matches")).toBe("3 matches");
  });
});

describe("resetsIn", () => {
  it.each([
    [0, "Resets in 1 minute"],
    [20, "Resets in 1 minute"],
    [60, "Resets in 1 minute"],
    [61, "Resets in 2 minutes"],
    [59 * 60, "Resets in 59 minutes"],
    [60 * 60, "Resets in 1 hour"],
    [3 * 60 * 60 - 30, "Resets in 3 hours"],
    [26 * 60 * 60, "Resets in 2 days"],
  ])("%i seconds", (s, text) => {
    expect(resetsIn(s)).toBe(text);
  });
});
