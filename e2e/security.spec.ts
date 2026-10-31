import { expect, test } from "@playwright/test";

test("pages send a CSP nonce, and every script in the HTML carries it", async ({ request }) => {
  const response = await request.get("/");
  const nonce = response.headers()["content-security-policy"]?.match(/'nonce-([^']+)'/)?.[1];
  expect(nonce).toBeTruthy();
  expect(response.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");

  // Scripts that these load later need no nonce: 'strict-dynamic' trusts them.
  const tags = (await response.text()).match(/<script\b[^>]*>/g) ?? [];
  const code = tags.filter((t) => !t.includes('type="application/ld+json"'));
  expect(code.length).toBeGreaterThan(0);
  for (const tag of code) expect(tag).toContain(`nonce="${nonce}"`);
});

test("security headers are set and the server is not named", async ({ request }) => {
  const headers = (await request.get("/")).headers();
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["x-powered-by"]).toBeUndefined();
});

test("crawler files are served", async ({ request }) => {
  expect(await (await request.get("/robots.txt")).text()).toContain("Sitemap:");
  expect(await (await request.get("/sitemap.xml")).text()).toContain("/features");
  expect(await (await request.get("/llms.txt")).text()).toContain("GitIssue");
  expect((await request.get("/.well-known/security.txt")).status()).toBe(200);
});
