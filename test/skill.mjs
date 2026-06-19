import { readFileSync, existsSync } from 'fs';
import assert from 'assert/strict';

// ── SKILL.md structure ─────────────────────────────────────────
const skill = readFileSync(new URL('../SKILL.md', import.meta.url), 'utf8');

assert.ok(skill.includes('## The Convert verb'), 'SKILL.md: Convert verb section missing');
assert.ok(skill.includes('No lessons present (seed-only)'), 'SKILL.md: seed-only mode missing');
assert.ok(skill.includes("no `/teach`"), 'SKILL.md: install-pointer (no /teach) missing');
assert.ok(skill.includes('mattpocock/skills'), 'SKILL.md: install-pointer must name mattpocock/skills');
assert.ok(skill.includes('skills/productivity/teach'), 'SKILL.md: install-pointer must name skills/productivity/teach');
assert.ok(skill.includes('vt-*'), 'SKILL.md: must reference vt-* class convention');
assert.ok(skill.includes(':root'), 'SKILL.md: Convert must mention :root override for topic colors');

// ── Demo conversion exercise ───────────────────────────────────
const before = new URL('../demo/data-studio-0001-before.html', import.meta.url);
const after  = new URL('../demo/data-studio-0001-after.html',  import.meta.url);
assert.ok(existsSync(before), 'demo/data-studio-0001-before.html missing');
assert.ok(existsSync(after),  'demo/data-studio-0001-after.html missing');

const beforeHtml = readFileSync(before, 'utf8');
const afterHtml  = readFileSync(after,  'utf8');

// before: should have inline style/script (the "legacy" state)
assert.ok(beforeHtml.includes('<style>'), 'before: should have inline <style>');
assert.ok(beforeHtml.includes('<script>'), 'before: should have inline <script>');
assert.ok(!beforeHtml.includes('visual-teach.css'), 'before: should not link visual-teach.css');

// after: must link assets and have no inline style/script for components
assert.ok(afterHtml.includes('visual-teach.css'), 'after: must link visual-teach.css');
assert.ok(afterHtml.includes('visual-teach.js'),  'after: must link visual-teach.js');
assert.ok(!afterHtml.match(/<script>\s*\/\*.*?checklist/s), 'after: must not have inline checklist JS');
assert.ok(!afterHtml.match(/<script>\s*\/\*.*?quiz/s),      'after: must not have inline quiz JS');

// after: must use vt-* classes
for (const cls of ['vt-kicker','vt-lede','vt-meta','vt-num','vt-callout','vt-pill','vt-checklist','vt-quiz','vt-sources']) {
  assert.ok(afterHtml.includes(cls), `after: must contain class ${cls}`);
}

// after: topic colors in :root override, not in component styles
assert.ok(afterHtml.includes(':root'), 'after: topic colors must be in :root override');
assert.ok(afterHtml.includes('--vt-accent'), 'after: must set --vt-accent token in :root');

// content parity: key teaching phrases preserved
const phrases = [
  'Reusable Data Sources',
  'fix a field once',
  'Open Data Sources',
  'Fix field types',
  'reusable data source',
  'Looker Studio Help',
];
for (const phrase of phrases) {
  assert.ok(afterHtml.includes(phrase), `after: teaching content lost — "${phrase}" not found`);
}

console.log('All checks passed.');
