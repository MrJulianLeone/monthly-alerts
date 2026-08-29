import { defineConfig } from "@playwright/test";

const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgres://localhost:5432/monthlyalerts_test";
const PORT = 3111;

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: `http://localhost:${PORT}`,
  },
  webServer: {
    command: `npx next dev -p ${PORT}`,
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      DATABASE_URL,
      EMAIL_DISABLED: "true",
      NEXT_PUBLIC_APP_URL: `http://localhost:${PORT}`,
      CRON_SECRET: "test-cron-secret",
    },
  },
});
