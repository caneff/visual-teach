// Validates that visual-teach.css contains all class definitions for table variants and pill/kbd set.
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(resolve(__dir, '../assets/visual-teach.css'), 'utf8');

let passed = 0;
let failed = 0;

function expect(selector, description) {
  if (css.includes(selector)) {
    console.log(`  ✓  ${description}`);
    passed++;
  } else {
    console.error(`  ✗  ${description}  [missing: ${selector}]`);
    failed++;
  }
}

console.log('\n=== Table variants ===');
expect('.vt-table-wrap',           'responsive overflow wrapper');
expect('.vt-table tbody tr:nth-child(even)', 'zebra rows');
expect('.vt-table.compact',        'compact density');
expect('th[scope="row"]',          'header column (th scope=row)');
expect('.vt-ok',                   'cell-status: ok (✓)');
expect('.vt-no',                   'cell-status: no (✗)');
expect('.vt-partial',              'cell-status: partial (~)');
expect('.vt-col-pick',             'comparison highlight column');
expect('.vt-pick-badge',           'recommended badge');
expect('.vt-row-key',              'row emphasis');
expect('.vt-kv',                   'key/value table');

console.log('\n=== Pill variants ===');
expect('.vt-pill.neutral',         'pill neutral fill');
expect('.vt-pill.good',            'pill good fill');
expect('.vt-pill.bad',             'pill bad fill');
expect('.vt-pill.warn',            'pill warn fill');
expect('.vt-pill.outline',         'pill outline variant');
expect('.vt-pill.sm',              'pill small size');
expect('.vt-pill.dot',             'pill status dot');
expect('.vt-pill.ic-check',        'pill leading icon check');
expect('.vt-pill.ic-warn',         'pill leading icon warn');

console.log('\n=== Difficulty / level pills ===');
expect('.vt-level',                'level pill base');
expect('.vt-level.beginner',       'level beginner');
expect('.vt-level.intermediate',   'level intermediate');
expect('.vt-level.advanced',       'level advanced');

console.log('\n=== Badge + kbd ===');
expect('.vt-badge',                'count/step badge');
expect('.vt-kbd',                  'keyboard keycap');

console.log(`\n${passed + failed} checks: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
