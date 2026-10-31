import { configDefaults, defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "src"), "server-only": path.resolve(__dirname, "src/test/server-only.ts") },
  },
  // e2e/ holds the Playwright tests, which run against a live server.
  test: { environment: "node", passWithNoTests: true, exclude: [...configDefaults.exclude, "e2e/**"] },
});
