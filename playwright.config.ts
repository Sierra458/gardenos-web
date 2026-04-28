import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run build && npm start",
    port: 3000,
    timeout: 120_000,
    reuseExistingServer: false,
    env: {
      SITE_PASSWORD: "test-password",
      COOKIE_SECRET: "test-secret-for-playwright-only",
      NODE_ENV: "production",
    },
  },
});
