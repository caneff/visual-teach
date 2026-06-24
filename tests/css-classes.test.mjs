// CSS contract for visual-teach.css — the single source of truth that every
// documented vt-* selector is defined and a handful of rule-body invariants
// hold. Pure presence is data-driven (one list); rule-body checks that carry
// real signal (no raw hex, token usage, the flow-vs-flex separation) are spelled
// out below. (Behavior of JS-wired blocks lives in the jsdom tests.)
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { test, expect } from "vitest";

const __dir = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(resolve(__dir, "../assets/visual-teach.css"), "utf8");

const ruleBody = (re) => css.match(re)?.[0] ?? "";
const NO_HEX = /#[0-9a-fA-F]{3,8}(?![0-9a-fA-F])/;

// Every documented selector must be defined somewhere in the CSS. One list,
// one assertion — add a selector here when you document a new vt-* class.
const DEFINED = [
  // diagram vocabulary
  ".vt-diagram",
  ".vt-node",
  ".vt-box",
  ".vt-node.em",
  ".vt-box.em",
  ".vt-flow",
  ".vt-row-start",
  ".vt-row",
  ".vt-col",
  ".vt-split",
  // flex playground
  ".vt-flex",
  ".vt-flex-item",
  ".vt-flex.jc-start",
  ".vt-flex.jc-end",
  ".vt-flex.jc-center",
  ".vt-flex.jc-between",
  ".vt-flex.jc-around",
  ".vt-flex.jc-evenly",
  ".vt-flex.ai-start",
  ".vt-flex.ai-end",
  ".vt-flex.ai-center",
  ".vt-flex.ai-stretch",
  // table
  ".vt-table-wrap",
  ".vt-table.compact",
  'th[scope="row"]',
  ".vt-ok",
  ".vt-no",
  ".vt-partial",
  ".vt-col-pick",
  ".vt-th-pick",
  ".vt-pick-badge",
  ".vt-row-key",
  ".vt-kv",
  // pills
  ".vt-pill.neutral",
  ".vt-pill.good",
  ".vt-pill.bad",
  ".vt-pill.warn",
  ".vt-pill.outline",
  ".vt-pill.sm",
  ".vt-pill.dot",
  ".vt-pill.ic-check",
  ".vt-pill.ic-warn",
  // difficulty / badge / kbd
  ".vt-level",
  ".vt-level.beginner",
  ".vt-level.intermediate",
  ".vt-level.advanced",
  ".vt-badge",
  ".vt-badge.sm",
  ".vt-kbd",
  // source card + teacher box
  ".vt-source",
  ".vt-source::before",
  ".vt-asks",
  // math (KaTeX)
  ".vt-math",
  ".vt-eq",
  // inline SVG inside vt-diagram
  ".vt-diagram svg",
];

test("every documented vt-* selector is defined in the CSS", () => {
  const missing = DEFINED.filter((sel) => !css.includes(sel));
  expect(
    missing,
    `selectors documented but undefined: ${missing.join(", ")}`
  ).toEqual([]);
});

test("diagram rules are tokenized — no raw hex colours", () => {
  expect(ruleBody(/\.vt-diagram\s*\{[^}]*\}/)).not.toMatch(NO_HEX);
  expect(
    ruleBody(/\.vt-node,\s*\.vt-box\s*\{[^}]*\}/) ||
      ruleBody(/\.vt-node\s*\{[^}]*\}/)
  ).not.toMatch(NO_HEX);
  expect(ruleBody(/\.vt-flow\s*\{[^}]*\}/)).not.toMatch(NO_HEX);
});

test(".vt-diagram svg is responsive and themed via currentColor", () => {
  const rule = ruleBody(/\.vt-diagram\s+svg\s*\{[^}]*\}/);
  expect(rule).toContain("display: block");
  expect(rule).toContain("max-width: 100%");
  expect(rule).toContain("height: auto");
  expect(rule).toContain("var(--vt-ink)");
  expect(rule).not.toMatch(NO_HEX);
});

test("flow injects an arrow connector; flex does NOT", () => {
  // vt-flow is for step sequences (auto → between children)…
  expect(css).toMatch(/\.vt-flow\s*>.*::before|\.vt-flow.*content/);
  // …vt-flex is for layout demos and must stay a plain flex container.
  expect(ruleBody(/\.vt-flex\s*\{[^}]*\}/)).toContain("display: flex");
  expect(css.includes(".vt-flex > * + *::before")).toBe(false);
});

test("print stylesheet exists for diagram blocks", () => {
  expect(css).toMatch(/@media print\s*\{/);
});

test("table polish uses dedicated tokens and structural rules", () => {
  expect(css).toContain("--vt-stripe");
  expect(
    ruleBody(/\.vt-table tbody tr:nth-child\(even\)\s*\{[^}]+\}/)
  ).toContain("--vt-stripe");
  expect(ruleBody(/\.vt-th-pick\s*\{[^}]+\}/)).toContain("border-top");
  expect(ruleBody(/\.vt-pick-badge\s*\{[^}]+\}/)).toContain("display: block");
  const kvTh = ruleBody(/\.vt-kv th\[scope="row"\]\s*\{[^}]+\}/);
  expect(kvTh.includes("background") || kvTh.includes("border-right")).toBe(
    true
  );
  expect(
    css.includes(".vt-table thead th:first-child") ||
      css.includes(".vt-table thead tr th:first-child")
  ).toBe(true);
});

test("neutral pill uses its own tint token, not the near-invisible --vt-soft", () => {
  expect(css).toContain("--vt-neutral-soft");
  expect(ruleBody(/\.vt-pill\.neutral\s*\{[^}]+\}/)).toContain(
    "--vt-neutral-soft"
  );
});

test("primary-source icon is a token-following CSS mask, not an emoji", () => {
  const before = css.slice(
    css.indexOf(".vt-source::before"),
    css.indexOf(".vt-source::before") + 300
  );
  expect(before).toContain("var(--vt-accent)");
  expect(before).toContain("mask:");
});

test("teacher box is ask-the-agent only — try-this / community split out", () => {
  expect(css.includes(".vt-teacher-try")).toBe(false);
  expect(css.includes(".vt-teacher-community")).toBe(false);
});

test("inline code nested in a link loses its pill background and side padding", () => {
  const rule = ruleBody(/a\s+code\s*\{[^}]+\}/);
  expect(rule, "a code rule must exist").toBeTruthy();
  expect(rule).toContain("background");
  expect(rule).toContain("padding-inline");
});

test("vt-split-panel has min-width:0 so grid items can shrink and vt-code inside scrolls", () => {
  const panelRule = ruleBody(/\.vt-split-panel\s*\{[^}]*\}/);
  expect(panelRule).toContain("min-width: 0");
});

test("vt-code pre has overflow-x:auto so long lines scroll inside any container", () => {
  const preRule = ruleBody(/\.vt-code pre\s*\{[^}]*\}/);
  expect(preRule).toContain("overflow-x: auto");
});

test("vt-io pre has overflow-x:auto so long lines scroll inside a split panel", () => {
  const preRule = ruleBody(/\.vt-io pre\s*\{[^}]*\}/);
  expect(preRule).toContain("overflow-x: auto");
});

test("vt-io-input and vt-io-output have min-width:0 so grid items shrink inside a split panel", () => {
  const itemRule = ruleBody(/\.vt-io-input,\s*\.vt-io-output\s*\{[^}]*\}/);
  expect(itemRule).toContain("min-width: 0");
});

test("vt-split-label has overflow-wrap:break-word so long labels wrap instead of clipping at the panel edge", () => {
  const labelRule = ruleBody(/\.vt-split-label\s*\{[^}]*\}/);
  expect(labelRule).toContain("overflow-wrap: break-word");
});

test("vt-math block exists and uses --vt-ink token for dark/light theming", () => {
  const rule = ruleBody(/\.vt-math\s*\{[^}]+\}/);
  expect(rule, "vt-math rule must exist").toBeTruthy();
  expect(rule).toContain("var(--vt-ink)");
  expect(rule).toContain("overflow-x: auto");
});

test("vt-eq centers and sizes display equations without inline style", () => {
  const rule = ruleBody(/\.vt-eq\s*\{[^}]+\}/);
  expect(rule, "vt-eq rule must exist").toBeTruthy();
  expect(rule).toContain("text-align: center");
  expect(rule).toContain("font-size");
});

test("vt-flow wraps so long sequences stay fully visible", () => {
  const flowRule = ruleBody(/\.vt-flow\s*\{[^}]*\}/);
  expect(
    flowRule,
    "vt-flow must wrap so all nodes are visible without scrolling"
  ).toContain("flex-wrap: wrap");
});

test("vt-row-start suppresses the leading arrow and margin on wrapped-row first items", () => {
  expect(
    css,
    "vt-row-start must clear margin-inline-start so no gap before the first item of a wrapped row"
  ).toMatch(/\.vt-flow\s*>\s*\.vt-row-start\s*\{[^}]*margin-inline-start:\s*0/);
  expect(
    css,
    "vt-row-start::before must set content:none to remove the → on wrapped-row starts"
  ).toMatch(/\.vt-flow\s*>\s*\.vt-row-start::before\s*\{[^}]*content:\s*none/);
});

test("vt-flow connector uses logical properties so RTL layouts get arrow on reading-order side", () => {
  expect(
    css,
    "vt-flow * + * must use margin-inline-start (not margin-left) for RTL-correct connector spacing"
  ).toMatch(/\.vt-flow\s*>\s*\*\s*\+\s*\*\s*\{[^}]*margin-inline-start:/);
  expect(
    css,
    "vt-flow * + *::before must use inset-inline-start (not left:) for RTL-correct arrow placement"
  ).toMatch(
    /\.vt-flow\s*>\s*\*\s*\+\s*\*::before\s*\{[^}]*inset-inline-start:/
  );
  expect(
    css,
    "vt-flow must not use physical left: on the connector arrow"
  ).not.toMatch(/\.vt-flow\s*>\s*\*\s*\+\s*\*::before\s*\{[^}]*\bleft:/);
});

test("vt-flow RTL glyph points left under dir=rtl", () => {
  expect(
    css,
    "a [dir=rtl] rule must flip the connector glyph to ← for RTL reading order"
  ).toMatch(
    /\[dir="rtl"\].*\.vt-flow\s*>.*::before[^{]*\{[^}]*content:\s*"←"/s
  );
});

test("vt-node does not use flex-direction:column so inline sup/sub stay on the baseline", () => {
  const nodeRule = ruleBody(/\.vt-node,\s*\.vt-box\s*\{[^}]*\}/);
  expect(
    nodeRule,
    "flex-direction:column collapses sup/sub to a second line"
  ).not.toContain("flex-direction: column");
});

test("vt-node uses text-align:center so label text is horizontally centred without flex-column", () => {
  const nodeRule = ruleBody(/\.vt-node,\s*\.vt-box\s*\{[^}]*\}/);
  expect(nodeRule).toContain("text-align: center");
});

test("th uses text-align:start (logical) not text-align:left so header labels align correctly under dir=rtl", () => {
  const thRule = ruleBody(/^th\s*\{[^}]*\}/m);
  expect(thRule, "th rule must exist").toBeTruthy();
  expect(thRule).toContain("text-align: start");
  expect(thRule).not.toContain("text-align: left");
});

test("forced-dark selector uses :root[data-theme='dark'] (spec 0,2,0) so a flat :root author override does not clobber vt's dark accent", () => {
  expect(css).toMatch(/:root\[data-theme="dark"\]\s*\{/);
  // Bare [data-theme="dark"] without :root prefix has spec 0,1,0 — same as flat :root, loses on source order
  expect(css).not.toMatch(/(?<![:\w])\[data-theme="dark"\]\s*\{/);
});

// ====== forced-colors + prefers-reduced-motion ======

const fcBlock = css.slice(css.indexOf("forced-colors: active"));

test("forced-colors block exists in CSS", () => {
  expect(css).toMatch(/@media\s*\(\s*forced-colors\s*:\s*active\s*\)/);
});

test("callout tones each expose a distinct text label via ::after under forced-colors", () => {
  expect(
    fcBlock,
    "warn callout must have a ::after label under forced-colors"
  ).toMatch(/\.vt-callout\.warn::after[^{]*\{[^}]*content:/);
  expect(
    fcBlock,
    "info callout must have a ::after label under forced-colors"
  ).toMatch(/\.vt-callout\.info::after[^{]*\{[^}]*content:/);
  expect(
    fcBlock,
    "insight callout must have a ::after label under forced-colors"
  ).toMatch(/\.vt-callout\.insight::after[^{]*\{[^}]*content:/);
  expect(
    fcBlock,
    "success callout must have a ::after label under forced-colors"
  ).toMatch(/\.vt-callout\.success::after[^{]*\{[^}]*content:/);
  expect(
    fcBlock,
    "risk callout must have a ::after label under forced-colors"
  ).toMatch(/\.vt-callout\.risk::after[^{]*\{[^}]*content:/);
});

test("quiz correct/wrong buttons get a non-color glyph under forced-colors", () => {
  expect(fcBlock, "correct option must add a checkmark glyph").toMatch(
    /\.vt-quiz button\.opt\.correct::before[^{]*\{[^}]*content:/
  );
  expect(fcBlock, "wrong option must add a cross glyph").toMatch(
    /\.vt-quiz button\.opt\.wrong::before[^{]*\{[^}]*content:/
  );
});

test("semantic pills get a text prefix under forced-colors so good/bad/warn are distinguishable", () => {
  expect(fcBlock, "vt-pill.good must add a non-color text label").toMatch(
    /\.vt-pill\.good[^{]*\{[^}]*content:|\.vt-pill\.good::before[^{]*\{[^}]*content:/
  );
  expect(fcBlock, "vt-pill.bad must add a non-color text label").toMatch(
    /\.vt-pill\.bad[^{]*\{[^}]*content:|\.vt-pill\.bad::before[^{]*\{[^}]*content:/
  );
  expect(fcBlock, "vt-pill.warn must add a non-color text label").toMatch(
    /\.vt-pill\.warn[^{]*\{[^}]*content:|\.vt-pill\.warn::before[^{]*\{[^}]*content:/
  );
});

test("vt-level tones are distinguished by distinct ::before glyphs under forced-colors", () => {
  // Each level must have a distinct glyph — they all use ● in normal mode
  expect(
    fcBlock,
    "beginner level must have a distinct marker under forced-colors"
  ).toMatch(
    /\.vt-level\.beginner[^{]*\{[^}]*content:|\.vt-level\.beginner::before[^{]*\{[^}]*content:/
  );
  expect(
    fcBlock,
    "intermediate level must have a distinct marker under forced-colors"
  ).toMatch(
    /\.vt-level\.intermediate[^{]*\{[^}]*content:|\.vt-level\.intermediate::before[^{]*\{[^}]*content:/
  );
  expect(
    fcBlock,
    "advanced level must have a distinct marker under forced-colors"
  ).toMatch(
    /\.vt-level\.advanced[^{]*\{[^}]*content:|\.vt-level\.advanced::before[^{]*\{[^}]*content:/
  );
});

test("vt-node.em gets a non-color distinction under forced-colors", () => {
  expect(
    fcBlock,
    "vt-node.em must have a visible non-color cue (border or outline)"
  ).toMatch(/(?:\.vt-node\.em|\.vt-box\.em)[^{]*\{[^}]*(?:outline|border):/);
});

test("progress-bar fill transition is disabled under prefers-reduced-motion", () => {
  expect(css).toMatch(/@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/);
  const rmBlock = css.slice(css.indexOf("prefers-reduced-motion: reduce"));
  expect(
    rmBlock,
    "progress-bar-fill transition must be removed under reduced-motion"
  ).toMatch(/\.vt-progress-bar-fill[^{]*\{[^}]*transition:\s*none/);
});

// ====== @media print hardening ======

const printStart = css.indexOf("@media print");
const printBlock =
  printStart >= 0
    ? css.slice(
        printStart,
        css.indexOf("}", css.indexOf("{", printStart + 10)) + 1000
      )
    : "";

test("print block forces light theme — dark backgrounds waste ink and are unreadable on paper", () => {
  // The print block must reset the 9 base tokens to their light values and
  // set color-scheme: light so the browser's own UA dark styles also revert.
  expect(printBlock, "print block must set color-scheme: light").toMatch(
    /color-scheme:\s*light/
  );
  expect(printBlock, "print block must reset --vt-paper to white").toMatch(
    /--vt-paper:\s*#ffffff/
  );
  expect(printBlock, "print block must reset --vt-ink to dark").toMatch(
    /--vt-ink:\s*#1a1f2b/
  );
});

test("print block hides the theme toggle so it does not print over page 1", () => {
  expect(printBlock, ".vt-theme-toggle must be display:none in print").toMatch(
    /\.vt-theme-toggle[^{]*\{[^}]*display:\s*none/
  );
});

test("print block hides code copy buttons so they do not print as empty boxes", () => {
  expect(printBlock, ".vt-code-copy must be display:none in print").toMatch(
    /\.vt-code-copy[^{]*\{[^}]*display:\s*none/
  );
});

test("atomic teaching blocks have break-inside:avoid so they do not split across printed pages", () => {
  expect(printBlock, ".vt-quiz must have break-inside:avoid in print").toMatch(
    /\.vt-quiz[^{]*\{[^}]*break-inside:\s*avoid/
  );
  expect(
    printBlock,
    ".vt-callout must have break-inside:avoid in print"
  ).toMatch(/\.vt-callout[^{]*\{[^}]*break-inside:\s*avoid/);
  expect(printBlock, ".vt-code must have break-inside:avoid in print").toMatch(
    /\.vt-code[^{]*\{[^}]*break-inside:\s*avoid/
  );
  expect(
    printBlock,
    ".vt-diagram must have break-inside:avoid in print"
  ).toMatch(/\.vt-diagram[^{]*\{[^}]*break-inside:\s*avoid/);
  expect(
    printBlock,
    ".vt-table tr must have break-inside:avoid in print"
  ).toMatch(/\.vt-table\s+tr[^{]*\{[^}]*break-inside:\s*avoid/);
  expect(printBlock, ".vt-split must have break-inside:avoid in print").toMatch(
    /\.vt-split[^{]*\{[^}]*break-inside:\s*avoid/
  );
});

test("print block documents that quiz options still print — the no-op specificity is intentional", () => {
  // .vt-quiz button { display:none } is overridden by .vt-quiz button.opt { display:block }
  // (higher specificity 0,2,1 > 0,1,1) so quiz options correctly print; only non-option
  // buttons are hidden. A comment in the print block must make this intent explicit.
  const printSection = css.slice(printStart);
  expect(
    printSection,
    "print block must document the intentional quiz-option specificity"
  ).toMatch(/quiz.*opt|opt.*quiz|options.*print|print.*options/i);
});
