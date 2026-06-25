import { test, expect } from "@playwright/test";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const PAGES = [
  { name: "base", path: "assets/base/demo.html" },
  { name: "callout", path: "assets/components/callout/demo.html" },
  { name: "checklist", path: "assets/components/checklist/demo.html" },
  { name: "chip", path: "assets/components/chip/demo.html" },
  { name: "code", path: "assets/components/code/demo.html" },
  { name: "diagram", path: "assets/components/diagram/demo.html" },
  { name: "math", path: "assets/components/math/demo.html" },
  { name: "quiz", path: "assets/components/quiz/demo.html" },
  { name: "table", path: "assets/components/table/demo.html" },
  { name: "teacher-box", path: "assets/components/teacher-box/demo.html" },
];

for (const { name, path } of PAGES) {
  test(`${name} default-theme screenshot`, async ({ page }) => {
    await page.goto(`file://${resolve(root, path)}`);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
}

for (const { name, path } of PAGES) {
  test(`${name} dark-theme screenshot`, async ({ page }) => {
    await page.goto(`file://${resolve(root, path)}`);
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => {
      document.documentElement.dataset.theme = "dark";
    });
    await expect(page).toHaveScreenshot(`${name}-dark.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
}
