import { describe, expect, it } from "vitest";
import { parseRepoUrl } from "./repo-url";

describe("parseRepoUrl", () => {
  it.each([
    ["https://github.com/o/r", "o", "r"],
    ["https://github.com/o/r.git", "o", "r"],
    ["https://github.com/o/r/issues/12", "o", "r"],
    ["http://www.github.com/o/r/", "o", "r"],
    ["www.github.com/o/r/", "o", "r"],
    ["github.com/facebook/react-native#readme", "facebook", "react-native"],
    ["o/r", "o", "r"],
    ["  my-org/my.repo  ", "my-org", "my.repo"],
    ["git@github.com:o/r.git", "o", "r"],
    ["o/r/issues/12", "o", "r"],
  ])("parses %s", (input, owner, repo) => {
    expect(parseRepoUrl(input)).toEqual({ owner, repo });
  });

  it.each(["https://gitlab.com/o/r", "just-text", "", "o", "o/r r", "bad owner/r", "https://github.com/o"])(
    "rejects %s",
    (input) => {
      expect(parseRepoUrl(input)).toBeNull();
    },
  );
});
