import { test, expect } from "@playwright/test";

test("anonymous /console redirects to /console/login", async ({ page }) => {
  await page.goto("/console");
  await expect(page).toHaveURL(/\/console\/login/);
});

test("share password does NOT unlock /console", async ({ page, context }) => {
  // Log in with share password
  await page.goto("/login");
  await page.getByLabel("Password").fill("test-password");
  await page.getByRole("button", { name: /enter/i }).click();
  await expect(page).toHaveURL("/");
  // Now try /console — should redirect to /console/login
  await page.goto("/console");
  await expect(page).toHaveURL(/\/console\/login/);
});

test("admin password unlocks /console", async ({ page }) => {
  await page.goto("/console/login");
  await page.getByLabel("Admin password").fill("test-admin-password");
  await page.getByRole("button", { name: /enter console/i }).click();
  await expect(page).toHaveURL("/console");
  await expect(page.getByText("GardenOS Console")).toBeVisible();
});

test("wrong admin password stays on /console/login", async ({ page }) => {
  await page.goto("/console/login");
  await page.getByLabel("Admin password").fill("nope");
  await page.getByRole("button", { name: /enter console/i }).click();
  await expect(page.locator("text=Wrong password")).toBeVisible();
});
