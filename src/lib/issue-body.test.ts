import { describe, expect, it } from "vitest";
import { addAttribution, attachScreenshots, SCREENSHOT_MARKER } from "./issue-body";

describe("attachScreenshots", () => {
  it("replaces the marker", () => {
    expect(attachScreenshots(`### Screenshots\n\n${SCREENSHOT_MARKER}\n\n### More`, ["https://x/a.png"])).toBe(
      "### Screenshots\n\n![screenshot 1](https://x/a.png)\n\n### More",
    );
  });
  it("appends when the marker was removed", () => {
    expect(attachScreenshots("Body", ["u1", "u2"])).toBe("Body\n\n![screenshot 1](u1)\n![screenshot 2](u2)");
  });
  it("strips the marker when there are no screenshots", () => {
    expect(attachScreenshots(`A\n\n${SCREENSHOT_MARKER}`, [])).toBe("A");
    expect(attachScreenshots("A", [])).toBe("A");
  });
});

describe("addAttribution", () => {
  it("adds a line with a link to the app at the end", () => {
    expect(addAttribution("Body\n\n", "https://gitissue.app")).toBe("Body\n\n_Created with [GitIssue](https://gitissue.app)_");
  });
});
