import { test, expect } from "vitest";
import { readFileSync, existsSync, readdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");

const skill = readFileSync(join(root, "SKILL.md"), "utf8");

// ── Slice 1: Root SKILL.md carries per-component seeding protocol ─────────────

test("SKILL.md: per-component seeding table names all 9 components", () => {
  for (const name of [
    "callout",
    "code",
    "table",
    "chip",
    "quiz",
    "checklist",
    "diagram",
    "math",
    "teacher-box",
  ]) {
    expect(
      skill,
      `SKILL.md must list component ${name} in seeding table`
    ).toContain(name);
  }
});

test("SKILL.md: seeding table maps math component to katex", () => {
  expect(skill).toMatch(/math.*katex|katex.*math/i);
});

test("SKILL.md: seeding table maps code component to prism", () => {
  expect(skill).toMatch(/code.*prism|prism.*code/i);
});

test("SKILL.md: seeding table maps diagram component to mermaid", () => {
  expect(skill).toMatch(/diagram.*mermaid|mermaid.*diagram/i);
});

test("SKILL.md: base is always seeded on first lesson", () => {
  expect(skill).toMatch(/always.*seed|seed.*always|first lesson|every lesson/i);
});

test("SKILL.md: seeding is per-component not blanket copy", () => {
  expect(skill).toMatch(
    /per.component|each component|component.*use|used component/i
  );
});

test("SKILL.md: no blanket cp -R of entire assets directory (filesystem-channel framing)", () => {
  // The blanket copy pattern copies all assets at once: assets/."  Per-component seeding does not.
  expect(skill).not.toContain('assets/."');
});

// ── Slice 2: teach fork is gone ──────────────────────────────────────────────

test("teach skill directory does not exist", () => {
  expect(existsSync(join(root, ".claude/skills/teach"))).toBe(false);
});

// ── Slice 3: scripts deleted, package.json cleaned ───────────────────────────

test("scripts/sync-teach-assets.sh is deleted", () => {
  expect(existsSync(join(root, "scripts/sync-teach-assets.sh"))).toBe(false);
});

test("scripts/derive-treatment.sh is deleted", () => {
  expect(existsSync(join(root, "scripts/derive-treatment.sh"))).toBe(false);
});

test("package.json has no sync-teach-assets script", () => {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  expect(pkg.scripts).not.toHaveProperty("sync-teach-assets");
});

// ── Slice 4: upstream-patch/teach-pointer.patch exists ───────────────────────

test("upstream-patch/teach-pointer.patch exists", () => {
  expect(existsSync(join(root, "upstream-patch/teach-pointer.patch"))).toBe(
    true
  );
});

// ── Slice 5: stale references removed from docs ──────────────────────────────

test("README.md: no owned teach fork row in skills table", () => {
  const readme = readFileSync(join(root, "README.md"), "utf8");
  expect(readme).not.toContain(".claude/skills/teach/");
});

test("CONTEXT.md: no treatment-twin glossary entry", () => {
  const context = readFileSync(join(root, "CONTEXT.md"), "utf8");
  expect(context).not.toMatch(/\*\*treatment twin\*\*/i);
});

test("CODING_STANDARDS.md: no sync-teach-assets reference", () => {
  const cs = readFileSync(join(root, "CODING_STANDARDS.md"), "utf8");
  expect(cs).not.toContain("sync-teach-assets");
});

test("docs/ab-comparison-methodology.md: no derive-treatment.sh reference", () => {
  const doc = readFileSync(
    join(root, "docs/ab-comparison-methodology.md"),
    "utf8"
  );
  expect(doc).not.toContain("derive-treatment.sh");
});

test("docs/ab-comparison-methodology.md: no disable-model-invocation reference", () => {
  const doc = readFileSync(
    join(root, "docs/ab-comparison-methodology.md"),
    "utf8"
  );
  expect(doc).not.toContain("disable-model-invocation");
});

// ── Slice 6: ADR 0006 superseded, new thin-separation ADR added ──────────────

test("docs/adr/0006 is marked superseded", () => {
  const adr = readFileSync(
    join(root, "docs/adr/0006-owned-fork-supersedes-add-on.md"),
    "utf8"
  );
  expect(adr).toMatch(/Status:\s*superseded/i);
});

test("a thin-separation ADR exists that records superseding the fork model", () => {
  const adrDir = join(root, "docs/adr");
  const adrs = readdirSync(adrDir);
  const found = adrs.some((f) => {
    const content = readFileSync(join(adrDir, f), "utf8");
    return /thin.separation|thin separation|supersedes.*fork|fork.*superseded/i.test(
      content
    );
  });
  expect(found).toBe(true);
});
