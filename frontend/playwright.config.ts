import { defineConfig } from "@playwright/test";

// Runs against built output served by scripts/serve.mjs (same routing rules as Caddy).
// Build first: `npm run build && npm run build:demo`. Uses the locally installed Chrome,
// so no browser download is needed.
const DEMO_PORT = 4318;
const API_PORT = 4319;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  timeout: 45_000,
  expect: { timeout: 8_000 },
  use: {
    channel: "chrome",
    locale: "en-GB",
    timezoneId: "Asia/Kolkata",
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: `node scripts/serve.mjs build-demo/client --port ${DEMO_PORT}`,
      port: DEMO_PORT,
      reuseExistingServer: true,
    },
    {
      command: `node scripts/serve.mjs build/client --port ${API_PORT}`,
      port: API_PORT,
      reuseExistingServer: true,
    },
  ],
  projects: [
    { name: "demo", testMatch: /demo\..*\.spec\.ts/, use: { baseURL: `http://localhost:${DEMO_PORT}` } },
    { name: "api", testMatch: /api\..*\.spec\.ts/, use: { baseURL: `http://localhost:${API_PORT}` } },
  ],
});
