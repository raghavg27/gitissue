import { describe, expect, it } from "vitest";
import { extractKeywords } from "./keywords";

describe("extractKeywords", () => {
  it("drops stopwords and short words, keeps order, dedupes", () => {
    expect(
      extractKeywords("So after I log in, the app crashes on the Profile screen. The profile screen is blank."),
    ).toEqual(["log", "crashes", "profile", "screen", "blank"]);
  });

  it("caps the count", () => {
    expect(extractKeywords("alpha bravo charlie delta echo", 3)).toEqual(["alpha", "bravo", "charlie"]);
  });
});
