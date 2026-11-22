import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3100);
const BASE_URL = `http://localhost:${PORT}`;
const isCI = !!process.env.CI;

/**
 * E2E runs against a production build (`next build && next start`).
 * In CI the build step can be skipped by setting E2E_SKIP_BUILD=1 when a
 * build already exists.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  // Each worker runs WebGL scenes; too many parallel GPU contexts makes canvases fail to start.
  workers: isCI ? 2 : 3,
  reporter: isCI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  expect: {
    // Screenshot tests of 3D views tolerate small GPU/antialiasing differences.
    toHaveScreenshot: { maxDiffPixelRatio: 0.02, animations: "disabled" },
  },
  use: {
    baseURL: BASE_URL,
    trace: isCI ? "on-first-retry" : "off",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium-desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit-desktop", use: { ...devices["Desktop Safari"] } },
    { name: "mobile-safari", use: { ...devices["iPhone 15"] } },
  ],
  webServer: {
    command: process.env.E2E_SKIP_BUILD
      ? `pnpm start --port ${PORT}`
      : `pnpm build && pnpm start --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !isCI,
    timeout: 180_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
