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
    "vt-row-start must clear margin-left so no gap before the first item of a wrapped row"
  ).toMatch(/\.vt-flow\s*>\s*\.vt-row-start\s*\{[^}]*margin-left:\s*0/);
  expect(
    css,
    "vt-row-start::before must set content:none to remove the → on wrapped-row starts"
  ).toMatch(/\.vt-flow\s*>\s*\.vt-row-start::before\s*\{[^}]*content:\s*none/);
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

test("forced-dark selector uses :root[data-theme='dark'] (spec 0,2,0) so a flat :root author override does not clobber vt's dark accent", () => {
  // :root[data-theme="dark"] beats an author's flat :root (both 0,1,0 vs 0,2,0)
  expect(css).toMatch(/:root\[data-theme="dark"\]\s*\{/);
  // Bare [data-theme="dark"] without :root prefix has only spec 0,1,0 — same as flat :root, loses on source order
  expect(css).not.toMatch(/(?<![:\w])\[data-theme="dark"\]\s*\{/);
});
