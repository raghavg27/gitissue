import { defineConfig, devices } from "@playwright/test";

// Runs against the production build: run `pnpm build` first.
export default defineConfig({
  testDir: "e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: "http://localhost:3100", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "phone", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "pnpm start --port 3100",
    url: "http://localhost:3100/robots.txt",
    reuseExistingServer: !process.env.CI,
  },
});
