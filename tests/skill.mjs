import { test, expect } from "vitest";
import { readFileSync, existsSync, readdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");

const index = readFileSync(join(root, "assets/visual-teach.md"), "utf8");

const skill = readFileSync(join(root, "SKILL.md"), "utf8");

// ── SKILL.md structure ─────────────────────────────────────────
test("SKILL.md: documents seeding assets into ./assets/", () => {
  expect(skill).toMatch(/seed/i);
  expect(skill).toContain("./assets/");
});

test("SKILL.md: install-pointer names mattpocock/skills", () => {
  expect(skill).toContain("mattpocock/skills");
});

test("SKILL.md: install-pointer names skills/productivity/teach", () => {
  expect(skill).toContain("skills/productivity/teach");
});

test("SKILL.md: references vt-* class convention", () => {
  expect(skill).toContain("vt-*");
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

// ── Chip class names: unchanged from monolith ─────────────────
test("chip.css ships .vt-pill (unchanged class name)", () => {
  const css = readFileSync(
    join(root, "assets/components/chip/chip.css"),
    "utf8"
  );
  expect(css).toContain(".vt-pill");
});

test("chip.css ships .vt-badge (unchanged class name)", () => {
  const css = readFileSync(
    join(root, "assets/components/chip/chip.css"),
    "utf8"
  );
  expect(css).toContain(".vt-badge");
});

test("chip.css ships .vt-kbd (unchanged class name)", () => {
  const css = readFileSync(
    join(root, "assets/components/chip/chip.css"),
    "utf8"
  );
  expect(css).toContain(".vt-kbd");
});

test("chip.css ships .vt-level (unchanged class name)", () => {
  const css = readFileSync(
    join(root, "assets/components/chip/chip.css"),
    "utf8"
  );
  expect(css).toContain(".vt-level");
});

// ── Showcase ──────────────────────────────────────────────────
test("demo/showcase.html exists", () => {
  expect(existsSync(join(root, "demo/showcase.html"))).toBe(true);
});

test("demo/showcase.html links base.css", () => {
  const html = readFileSync(join(root, "demo/showcase.html"), "utf8");
  expect(html).toContain("base/base.css");
});

test("demo/showcase.html references all 9 components", () => {
  const html = readFileSync(join(root, "demo/showcase.html"), "utf8");
  for (const name of COMPONENTS) {
    expect(html, `showcase must include ${name} component`).toContain(
      `components/${name}`
    );
  }
});

// ── Deleted files ─────────────────────────────────────────────
test("blocks/ directory is empty (block md files replaced by component demos)", () => {
  const blocksDir = join(root, "assets/blocks");
  const files = existsSync(blocksDir)
    ? readdirSync(blocksDir).filter((f) => f.endsWith(".md"))
    : [];
  expect(
    files,
    "blocks/*.md files must be deleted — component demos are the new docs"
  ).toEqual([]);
});

test("cron demo files are removed", () => {
  expect(existsSync(join(root, "demo/cron-0001-before.html"))).toBe(false);
  expect(existsSync(join(root, "demo/cron-0001-after.html"))).toBe(false);
  expect(existsSync(join(root, "demo/cron-0001-compare.html"))).toBe(false);
});

// ── AGENTS.md ─────────────────────────────────────────────────
test("AGENTS.md: no manual 'keep the cheatsheet in sync' rule", () => {
  const agents = readFileSync(join(root, "AGENTS.md"), "utf8");
  expect(agents).not.toMatch(/keep the cheatsheet in sync/i);
});

test("AGENTS.md: mentions machine-enforced showcase", () => {
  const agents = readFileSync(join(root, "AGENTS.md"), "utf8");
  expect(agents).toMatch(/showcase|machine.enforc/i);
});

// ── type="module" hardening — assertions preserved in the catalog ──
test(`catalog: warns against type="module" on the base/component scripts`, () => {
  expect(index).toMatch(
    /type="module".*break|break.*type="module"|do not.*type="module"|not.*type="module"|type="module".*not|plain.*script|not.*ES module|CORS/i
  );
});

// ── Component catalog entries ─────────────────────────────────
test("catalog: lists all 9 components", () => {
  for (const name of COMPONENTS) {
    expect(index, `catalog must list component ${name}`).toContain(
      `components/${name}`
    );
  }
});

// ── Selective-load instruction ────────────────────────────────
test("catalog: carries selective-load / open-only-what-you-need instruction", () => {
  expect(index).toMatch(
    /open only.*component|only.*component.*you need|load.*only/i
  );
});

// ── Compose-only: no Convert references in domain docs ────────
const context = readFileSync(join(root, "CONTEXT.md"), "utf8");
const prd = readFileSync(join(root, "docs/PRD.md"), "utf8");

test("CONTEXT.md: no Convert (mode) glossary entry", () => {
  expect(context).not.toMatch(/\*\*Convert \(mode\)\*\*/);
});

test("CONTEXT.md: no two-mode framing mentioning Convert", () => {
  expect(context).not.toContain("**Convert**");
});

test("docs/PRD.md: §9 heading does not name Convert verb", () => {
  expect(prd).not.toContain("## 9. Invocation: the Convert verb");
});

test("docs/PRD.md: no bulk-migrator framing for Convert", () => {
  expect(prd).not.toContain("bulk migrat");
});

test("docs/adr/: an ADR exists recording the Compose-only decision", () => {
  const adrDir = join(root, "docs/adr");
  const adrs = readdirSync(adrDir);
  const composeOnly = adrs.some((f) => {
    const content = readFileSync(join(adrDir, f), "utf8");
    return /compose.only|no.*convert.*verb|remove.*convert/i.test(content);
  });
  expect(composeOnly).toBe(true);
});

// ── Theming overrides — live in the catalog ───────────────────
test("catalog: theming example uses a flat :root block", () => {
  const themingSection = index.slice(index.indexOf("## Theming"));
  expect(themingSection).toMatch(/:root\s*\{[^}]*--vt-accent/);
});

test("catalog: theming section explains that vt dark rules win via higher specificity so a flat override is safe", () => {
  const themingSection = index.slice(index.indexOf("## Theming"));
  expect(themingSection).toMatch(
    /higher.?specificity|:root\[data-theme|spec.*0,2,0|0,2,0/i
  );
});

test("catalog: theming section lists which tokens vt re-sets in dark mode", () => {
  const themingSection = index.slice(index.indexOf("## Theming"));
  expect(themingSection).toMatch(/--vt-accent.*--vt-ink|--vt-ink.*--vt-accent/);
  expect(themingSection).toMatch(/dark mode|theme-varying/i);
});
