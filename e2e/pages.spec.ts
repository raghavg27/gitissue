import { expect, test } from "@playwright/test";

const PUBLIC_PAGES = [
  { path: "/", heading: "Say the bug out loud" },
  { path: "/features", heading: "Features" },
  { path: "/privacy", heading: "Privacy" },
  { path: "/terms", heading: "Terms" },
];

for (const { path, heading } of PUBLIC_PAGES) {
  test(`${path} loads with its own heading and a canonical URL`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(heading);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  });
}

test("each page has a different title", async ({ page }) => {
  const titles = new Set<string>();
  for (const { path } of PUBLIC_PAGES) {
    await page.goto(path);
    titles.add(await page.title());
  }
  expect(titles.size).toBe(PUBLIC_PAGES.length);
});

test("an unknown page returns a real 404 with a link home", async ({ page }) => {
  const response = await page.goto("/no-such-page");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("link", { name: /home/i }).first()).toBeVisible();
});

test("the repo box rejects text that is not a GitHub repo", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Which repo are you testing?").fill("not a repo");
  await page.getByRole("button", { name: "Open repo" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "not a GitHub repo" })).toBeVisible();
  await expect(page).toHaveURL("/");
});

test("the skip link moves focus to the main content", async ({ page, isMobile }) => {
  test.skip(isMobile, "Phones have no Tab key.");
  await page.goto("/features");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main#main")).toBeFocused();
});

test("signed-out visitors go home from private pages", async ({ page }) => {
  for (const path of ["/reports", "/devices"]) {
    await page.goto(path);
    await expect(page).toHaveURL("/");
  }
});

test("/settings moves permanently to /devices", async ({ request }) => {
  const response = await request.get("/settings", { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe("/devices");
});

test("/demo goes to the demo video on YouTube", async ({ request }) => {
  const response = await request.get("/demo", { maxRedirects: 0 });
  expect(response.status()).toBe(307);
  expect(response.headers().location).toBe("https://youtu.be/9vjFmfWYAlo");
});
