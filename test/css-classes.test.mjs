// Validates that visual-teach.css contains all class definitions for table variants and pill/kbd set.
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { test, expect } from 'vitest';

const __dir = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(resolve(__dir, '../assets/visual-teach.css'), 'utf8');

function hasClass(selector) {
  return css.includes(selector);
}

test('table variants', () => {
  expect(hasClass('.vt-table-wrap'),                       'responsive overflow wrapper').toBe(true);
  expect(hasClass('.vt-table tbody tr:nth-child(even)'),   'zebra rows').toBe(true);
  expect(hasClass('.vt-table.compact'),                    'compact density').toBe(true);
  expect(hasClass('th[scope="row"]'),                      'header column (th scope=row)').toBe(true);
  expect(hasClass('.vt-ok'),                               'cell-status: ok (✓)').toBe(true);
  expect(hasClass('.vt-no'),                               'cell-status: no (✗)').toBe(true);
  expect(hasClass('.vt-partial'),                          'cell-status: partial (~)').toBe(true);
  expect(hasClass('.vt-col-pick'),                         'comparison highlight column').toBe(true);
  expect(hasClass('.vt-pick-badge'),                       'recommended badge').toBe(true);
  expect(hasClass('.vt-row-key'),                          'row emphasis').toBe(true);
  expect(hasClass('.vt-kv'),                               'key/value table').toBe(true);
});

test('table polish — recommended column', () => {
  expect(hasClass('.vt-th-pick'), 'recommended-column header class (th-level, not col-level)').toBe(true);
  const thPickRule = css.match(/\.vt-th-pick\s*\{[^}]+\}/)?.[0] ?? '';
  expect(thPickRule.includes('border-top'), 'recommended header has accent top border').toBe(true);
  const badgeRule = css.match(/\.vt-pick-badge\s*\{[^}]+\}/)?.[0] ?? '';
  expect(badgeRule.includes('display: block'), 'pick badge is block-level so it stacks above column name').toBe(true);
});

test('table polish — zebra striping token', () => {
  expect(css.includes('--vt-stripe'), 'dedicated --vt-stripe token for zebra rows').toBe(true);
  const zebraRule = css.match(/\.vt-table tbody tr:nth-child\(even\)\s*\{[^}]+\}/)?.[0] ?? '';
  expect(zebraRule.includes('--vt-stripe'), 'zebra uses --vt-stripe token not raw --vt-soft').toBe(true);
});

test('table polish — key/value visual separation', () => {
  const kvThRule = css.match(/\.vt-kv th\[scope="row"\]\s*\{[^}]+\}/)?.[0] ?? '';
  expect(
    kvThRule.includes('background') || kvThRule.includes('border-right'),
    'key column has background or border-right for visual separation'
  ).toBe(true);
});

test('table polish — matrix first-column header label', () => {
  expect(
    hasClass('.vt-table thead th:first-child') || hasClass('.vt-table thead tr th:first-child'),
    'matrix row-label column header gets reduced visual weight'
  ).toBe(true);
});

test('pill variants', () => {
  expect(hasClass('.vt-pill.neutral'),  'pill neutral fill').toBe(true);
  expect(hasClass('.vt-pill.good'),     'pill good fill').toBe(true);
  expect(hasClass('.vt-pill.bad'),      'pill bad fill').toBe(true);
  expect(hasClass('.vt-pill.warn'),     'pill warn fill').toBe(true);
  expect(hasClass('.vt-pill.outline'),  'pill outline variant').toBe(true);
  expect(hasClass('.vt-pill.sm'),       'pill small size').toBe(true);
  expect(hasClass('.vt-pill.dot'),      'pill status dot').toBe(true);
  expect(hasClass('.vt-pill.ic-check'), 'pill leading icon check').toBe(true);
  expect(hasClass('.vt-pill.ic-warn'),  'pill leading icon warn').toBe(true);
});

test('difficulty / level pills', () => {
  expect(hasClass('.vt-level'),              'level pill base').toBe(true);
  expect(hasClass('.vt-level.beginner'),     'level beginner').toBe(true);
  expect(hasClass('.vt-level.intermediate'), 'level intermediate').toBe(true);
  expect(hasClass('.vt-level.advanced'),     'level advanced').toBe(true);
});

test('badge + kbd', () => {
  expect(hasClass('.vt-badge'),    'count/step badge').toBe(true);
  expect(hasClass('.vt-badge.sm'), 'badge small size for inline "Step N of M" use').toBe(true);
  expect(hasClass('.vt-kbd'),      'keyboard keycap').toBe(true);
});

test('neutral color token', () => {
  expect(css.includes('--vt-neutral-soft'), 'dedicated neutral-soft tint token').toBe(true);
  // neutral pill must reference the new token, not the near-invisible --vt-soft
  const neutralRule = css.match(/\.vt-pill\.neutral\s*\{[^}]+\}/)?.[0] ?? '';
  expect(neutralRule.includes('--vt-neutral-soft'), 'neutral pill uses --vt-neutral-soft background').toBe(true);
});

test('primary-source card', () => {
  expect(hasClass('.vt-source'),         'primary-source card class defined').toBe(true);
  expect(hasClass('.vt-source::before'), 'primary-source has ::before for SVG icon').toBe(true);
  const beforeIdx = css.indexOf('.vt-source::before');
  const beforeBlock = css.slice(beforeIdx, beforeIdx + 300);
  expect(beforeBlock.includes('var(--vt-accent)'), 'primary-source icon follows --vt-accent token').toBe(true);
  expect(beforeBlock.includes('mask:'),            'primary-source icon uses CSS mask (not emoji)').toBe(true);
});

test('teacher box is ask-the-agent only', () => {
  expect(hasClass('.vt-asks'),              'question chips container present').toBe(true);
  // try-this prompt and community pointer split out into reusable blocks:
  expect(hasClass('.vt-teacher-try'),       'try-this no longer a teacher-box class').toBe(false);
  expect(hasClass('.vt-teacher-community'), 'community pointer no longer a teacher-box class').toBe(false);
});

test('flex playground block — vt-flex', () => {
  // container
  expect(hasClass('.vt-flex'),              'vt-flex container defined').toBe(true);
  // must be display:flex with no injected arrow content
  const flexRule = css.match(/\.vt-flex\s*\{[^}]+\}/)?.[0] ?? '';
  expect(flexRule.includes('display: flex') || flexRule.includes('display:flex'),
    'vt-flex is a real flex container').toBe(true);
  // no arrow pseudo-element on children (that belongs to vt-flow, not vt-flex)
  expect(!css.includes('.vt-flex > * + *::before'),
    'vt-flex must NOT inject arrow separators between children').toBe(true);
  // child item
  expect(hasClass('.vt-flex-item'),         'vt-flex-item child style defined').toBe(true);
  // justify-content modifiers
  expect(hasClass('.vt-flex.jc-start'),    'jc-start modifier').toBe(true);
  expect(hasClass('.vt-flex.jc-end'),      'jc-end modifier').toBe(true);
  expect(hasClass('.vt-flex.jc-center'),   'jc-center modifier').toBe(true);
  expect(hasClass('.vt-flex.jc-between'),  'jc-between modifier').toBe(true);
  expect(hasClass('.vt-flex.jc-around'),   'jc-around modifier').toBe(true);
  expect(hasClass('.vt-flex.jc-evenly'),   'jc-evenly modifier').toBe(true);
});
