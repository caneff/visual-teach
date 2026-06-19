// Screenshot a demo lesson (or one element of it) to a PNG.
// Usage: node demo/shot.mjs <html-file> [out.png] [cssSelector]
//   node demo/shot.mjs demo/cron-0001-after.html              -> full page  -> demo/cron-0001-after.png
//   node demo/shot.mjs demo/cron-0001-after.html out.png .vt-diagram   -> just that element
import { chromium } from 'playwright';
import { resolve } from 'node:path';

const [file, out, selector] = process.argv.slice(2);
if (!file) {
  console.error('usage: node demo/shot.mjs <html-file> [out.png] [cssSelector]');
  process.exit(1);
}
const abs = resolve(file);
const outPath = out || abs.replace(/\.html?$/i, '.png');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 1400 } });
await page.goto('file://' + abs);
await page.waitForLoadState('networkidle');
const target = selector ? page.locator(selector).first() : page;
await target.screenshot({ path: outPath, fullPage: !selector });
await browser.close();
console.log('wrote', outPath);
