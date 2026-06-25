import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "visual.spec.js",
  fullyParallel: true,
  retries: 0,
  reporter: [["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  snapshotPathTemplate: "{testDir}/visual-snapshots/{testFilePath}/{arg}{ext}",
});
