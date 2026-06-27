import { test, expect } from "@playwright/test";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "../skills/visual-teach");

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

const WIDTH = 1280;

// Capture a content-sized fixed viewport instead of a fullPage screenshot.
// fullPage rounds the captured height ±1px between runs (the page's layout
// height is fractional), and toHaveScreenshot hard-fails on any dimension
// mismatch — a flaky gate. The page's scrollHeight is deterministic, so we
// size the viewport to it and screenshot that: the dimension is now stable,
// and maxDiffPixelRatio still absorbs trivial pixel differences.
async function shoot(page, path, snapshot, before) {
  await page.setViewportSize({ width: WIDTH, height: 720 });
  await page.goto(`file://${resolve(root, path)}`);
  await page.waitForLoadState("networkidle");
  if (before) await before();
  const height = await page.evaluate(
    () => document.documentElement.scrollHeight
  );
  await page.setViewportSize({ width: WIDTH, height });
  await expect(page).toHaveScreenshot(snapshot, { maxDiffPixelRatio: 0.02 });
}

for (const { name, path } of PAGES) {
  test(`${name} default-theme screenshot`, async ({ page }) => {
    await shoot(page, path, `${name}.png`);
  });
}

for (const { name, path } of PAGES) {
  test(`${name} dark-theme screenshot`, async ({ page }) => {
    await shoot(page, path, `${name}-dark.png`, () =>
      page.evaluate(() => {
        document.documentElement.dataset.theme = "dark";
      })
    );
  });
}
