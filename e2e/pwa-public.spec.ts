import { test, expect } from "@playwright/test";

// PWA install requires these endpoints to be reachable WITHOUT auth — the
// browser fetches them before the user has logged in. Regression guard for
// the middleware allowlist.

test("anonymous /manifest.webmanifest returns valid JSON, not a login redirect", async ({ request }) => {
  const res = await request.get("/manifest.webmanifest");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("application/manifest+json");
  const body = await res.json();
  expect(body.name || body.short_name).toBeTruthy();
});

test("anonymous /icon is reachable", async ({ request }) => {
  const res = await request.get("/icon");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("image/");
});

test("anonymous /apple-icon is reachable", async ({ request }) => {
  const res = await request.get("/apple-icon");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("image/");
});
