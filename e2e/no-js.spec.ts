import { expect, test } from "@playwright/test";

test.use({ javaScriptEnabled: false });

test("the repo box works without JavaScript", async ({ page, request }) => {
  await page.goto("/");
  await page.getByLabel("Which repo are you testing?").fill("not a repo");
  await page.getByRole("button", { name: "Open repo" }).click();
  await expect(page).toHaveURL(/\/\?error=repo/);
  await expect(page.getByRole("alert").filter({ hasText: "not a GitHub repo" })).toBeVisible();

  // A good link goes to the repo page. The test stops at the redirect, so it needs no GitHub call.
  const response = await request.get("/open?repo=github.com/vercel/next.js", { maxRedirects: 0 });
  expect(response.status()).toBe(303);
  expect(new URL(response.headers().location).pathname).toBe("/vercel/next.js");
});
