import { test, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");

// ── Base files ─────────────────────────────────────────────────
test("assets/base/base.css exists", () => {
  expect(existsSync(join(root, "assets/base/base.css"))).toBe(true);
});

test("assets/base/base.js exists", () => {
  expect(existsSync(join(root, "assets/base/base.js"))).toBe(true);
});

test("base.css defines the 9 --vt-* tokens", () => {
  const css = readFileSync(join(root, "assets/base/base.css"), "utf8");
  for (const token of [
    "--vt-ink",
    "--vt-muted",
    "--vt-accent",
    "--vt-accent-fg",
    "--vt-rule",
    "--vt-paper",
    "--vt-good",
    "--vt-bad",
    "--vt-warn",
  ]) {
    expect(css, `base.css must define ${token}`).toContain(token);
  }
});

test("base.css has dark mode rules", () => {
  const css = readFileSync(join(root, "assets/base/base.css"), "utf8");
  expect(css).toMatch(/@media\s*\(\s*prefers-color-scheme\s*:\s*dark\s*\)/);
  expect(css).toMatch(/:root\[data-theme="dark"\]/);
});

// ── Component structure ────────────────────────────────────────
const COMPONENTS = [
  "callout",
  "code",
  "table",
  "chip",
  "quiz",
  "checklist",
  "diagram",
  "math",
  "teacher-box",
];

for (const name of COMPONENTS) {
  test(`components/${name}/demo.html exists`, () => {
    expect(existsSync(join(root, "assets/components", name, "demo.html"))).toBe(
      true
    );
  });

  test(`components/${name}/${name}.css exists`, () => {
    expect(
      existsSync(join(root, "assets/components", name, `${name}.css`))
    ).toBe(true);
  });

  test(`component ${name}: CSS does not redefine :root tokens`, () => {
    const cssPath = join(root, "assets/components", name, `${name}.css`);
    const css = readFileSync(cssPath, "utf8");
    expect(
      css,
      `${name}.css must not define :root { --vt-* } tokens — those live in base.css`
    ).not.toMatch(/:root\s*\{[^}]*--vt-ink/);
  });
}

// Interactive components must ship a JS file.
const JS_COMPONENTS = ["quiz", "checklist", "code", "diagram", "math"];
for (const name of JS_COMPONENTS) {
  test(`component ${name} ships its own JS file`, () => {
    expect(
      existsSync(join(root, "assets/components", name, `${name}.js`))
    ).toBe(true);
  });
}
