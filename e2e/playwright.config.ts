import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env.e2e") });

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { open: "never" }], ["list"]],

  timeout: 60_000,

  expect: {
    timeout: 10_000,
  },

  use: {
    baseURL,
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
  },

  projects: [
    // ---------- Auth setup (runs first) ----------
    {
      name: "setup",
      testDir: "./fixtures",
      testMatch: "global-setup.ts",
    },

    // ---------- Desktop (1280x720) ----------
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
        storageState: path.resolve(__dirname, ".auth/customer.json"),
      },
      dependencies: ["setup"],
    },

    // ---------- Mobile (390x844, Pixel 5 via Chromium) ----------
    {
      name: "mobile",
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 390, height: 844 },
        storageState: path.resolve(__dirname, ".auth/customer.json"),
      },
      dependencies: ["setup"],
    },
  ],

  webServer: {
    command: "npm run dev:local",
    cwd: path.resolve(__dirname, ".."),
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
