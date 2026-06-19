// Validates that visual-teach.css contains all required selectors for issue-3 blocks.
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(resolve(__dirname, '../assets/visual-teach.css'), 'utf8');

// Checks for selector as whole word (followed by space, {, :, ,, or end of non-word char)
function hasSelector(css, selector) {
  // Escape special regex chars, then match selector at word boundary or followed by CSS char
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escaped + '(?=[\\s{:,>+~])').test(css);
}

const required = [
  // Shell — meta bar
  ['.vt-metabar', 'meta bar container'],
  ['.vt-metabar .item', 'meta bar item slot'],
  // Shell — difficulty level pill
  ['.vt-level', 'difficulty/level pill'],
  // Shell — section anchor (CSS-only hover-reveal)
  ['.vt-anchor', 'section anchor link'],
  // Shell — prev/next lesson nav
  ['.vt-lessonnav', 'prev/next lesson nav'],
  // New blocks
  ['.vt-objectives', 'objectives block'],
  ['.vt-mission', 'mission tie-in block'],
  ['.vt-source', 'primary-source card'],
  ['.vt-recap', 'recap block'],
  ['.vt-cta', 'next-lesson CTA button'],
];

let failures = 0;
for (const [selector, label] of required) {
  if (!hasSelector(css, selector)) {
    console.error(`FAIL [${label}]: selector "${selector}" missing from visual-teach.css`);
    failures++;
  } else {
    console.log(`PASS [${label}]`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} test(s) failed.`);
  process.exit(1);
}
console.log(`\nAll ${required.length} tests passed.`);
