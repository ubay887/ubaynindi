import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : {
    command: "npm run dev",
    url: "http://127.0.0.1:3000/api/health",
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      APP_ORIGIN: "http://127.0.0.1:3000",
      DATABASE_URL: process.env.DATABASE_URL || "postgres://test:test@127.0.0.1:5432/test",
      RATE_LIMIT_HMAC_SECRET: "playwright-only-secret-change-this-value-32",
    },
  },
});
