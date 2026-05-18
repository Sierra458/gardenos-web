import { test, expect } from "@playwright/test";

test("anonymous home is redirected to /login", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login/);
});

test("wrong password stays on /login with error", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Password").fill("nope");
  await page.getByRole("button", { name: /enter/i }).click();
  await expect(page.locator("text=Wrong password")).toBeVisible();
});

test("right password lands on home with sidebar", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Password").fill("test-password");
  await page.getByRole("button", { name: /enter/i }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: "GardenOS" })).toBeVisible();
  await expect(page.getByText("Recent updates")).toBeVisible();
});
