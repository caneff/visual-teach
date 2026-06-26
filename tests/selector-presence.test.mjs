// Verify every documented vt-* selector is defined in the shipped CSS.
// Uses css-tree to parse the CSS AST — avoids false positives from comments
// and string values that would fool a raw String.includes on the source text.
import { readFileSync, readdirSync } from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";
import { test, expect } from "vitest";
import * as csstree from "css-tree";

const __dir = dirname(fileURLToPath(import.meta.url));
const assets = resolve(__dir, "../assets");
const componentsDir = join(assets, "components");

function tryRead(p) {
  try {
    return readFileSync(p, "utf8");
  } catch {
    return null;
  }
}

const css = [
  join(assets, "base", "base.css"),
  ...readdirSync(componentsDir).map((name) =>
    join(componentsDir, name, `${name}.css`)
  ),
]
  .map(tryRead)
  .filter(Boolean)
  .join("\n");

// Parse into an AST (strips comments) then generate back to a normalized
// string — we search this rather than the raw source, so comment text
// cannot produce a false "selector found" match.
const ast = csstree.parse(css, { parseValue: false });
const generatedCss = csstree.generate(ast);

// Every selector listed here must appear (as a substring of a full selector)
// in the shipped CSS. Add a selector here when you document a new vt-* class.
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
  // teacher box
  ".vt-asks",
  // math (KaTeX)
  ".vt-math",
  ".vt-eq",
  // inline SVG inside vt-diagram
  ".vt-diagram svg",
  // breakout geometry
  ".vt-wide",
  "main>.vt-wide",
  "main>.vt-table-wrap.vt-wide",
  "main>.vt-code.vt-wide",
  "main>.vt-diagram.vt-wide",
];

test("every documented vt-* selector is defined in the CSS", () => {
  const missing = DEFINED.filter((sel) => !generatedCss.includes(sel));
  expect(
    missing,
    `selectors documented but undefined: ${missing.join(", ")}`
  ).toEqual([]);
});
