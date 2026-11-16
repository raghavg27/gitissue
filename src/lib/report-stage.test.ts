import { describe, expect, it } from "vitest";
import { backTarget } from "./report-stage";

describe("backTarget", () => {
  it("goes from the matches to the description", () => {
    expect(backTarget("duplicates", true)).toBe("describe");
  });

  it("goes from the choose and comment screens to the matches", () => {
    expect(backTarget("choose", true)).toBe("duplicates");
    expect(backTarget("comment", true)).toBe("duplicates");
  });

  it("goes from the review screen to the matches only when there are matches", () => {
    expect(backTarget("review", true)).toBe("duplicates");
    expect(backTarget("review", false)).toBeNull();
  });

  it("has no way back from the first, the busy and the last screen", () => {
    for (const stage of ["describe", "analyzing", "posted"]) expect(backTarget(stage, true)).toBeNull();
  });
});
