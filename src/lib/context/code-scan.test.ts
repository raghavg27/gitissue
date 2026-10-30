import { describe, expect, it } from "vitest";
import { selectCodeFiles } from "./code-scan";

const paths = [
  "node_modules/x/LoginScreen.tsx",
  "src/__tests__/LoginScreen.test.tsx",
  "src/screens/LoginScreen.tsx",
  "src/screens/HomeScreen.tsx",
  "src/navigation/AppNavigator.tsx",
  "src/utils/date.ts",
  "assets/logo.png",
  "android/app/src/main/java/com/shwe/ProfileActivity.kt",
  "dist/bundle.js",
];

describe("selectCodeFiles", () => {
  it("excludes vendored, test, build and non-source files", () => {
    const { screens, fetch } = selectCodeFiles(paths, ["login"]);
    const all = [...screens, ...fetch];
    expect(all).not.toContain("node_modules/x/LoginScreen.tsx");
    expect(all).not.toContain("src/__tests__/LoginScreen.test.tsx");
    expect(all).not.toContain("assets/logo.png");
    expect(all).not.toContain("dist/bundle.js");
  });

  it("lists screen-like files, keyword matches first", () => {
    const { screens } = selectCodeFiles(paths, ["login"]);
    expect(screens[0]).toBe("src/screens/LoginScreen.tsx");
    expect(screens).toContain("android/app/src/main/java/com/shwe/ProfileActivity.kt");
    expect(screens).not.toContain("src/utils/date.ts");
  });

  it("ranks keyword + screen files above unrelated ones and respects max", () => {
    const { fetch } = selectCodeFiles(paths, ["login"], 2);
    expect(fetch).toEqual(["src/screens/LoginScreen.tsx", "src/navigation/AppNavigator.tsx"]);
  });
});
