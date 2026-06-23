import { test, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");
const skillDir = join(root, ".claude/skills/teach");
const skillFile = join(skillDir, "SKILL.md");

// ── Skill exists ───────────────────────────────────────────────────────────────

test("teach skill directory exists", () => {
  expect(existsSync(skillDir)).toBe(true);
});

test("teach SKILL.md exists", () => {
  expect(existsSync(skillFile)).toBe(true);
});

// ── Frontmatter ───────────────────────────────────────────────────────────────

const skill = existsSync(skillFile) ? readFileSync(skillFile, "utf8") : "";

test("teach SKILL.md: name frontmatter is teach", () => {
  expect(skill).toMatch(/^name:\s*teach\s*$/m);
});

test("teach SKILL.md: disable-model-invocation is true", () => {
  expect(skill).toMatch(/^disable-model-invocation:\s*true\s*$/m);
});

test("teach SKILL.md: effort is high", () => {
  expect(skill).toMatch(/^effort:\s*high\s*$/m);
});

// ── Upstream pedagogy is faithfully copied ────────────────────────────────────

test("teach SKILL.md: carries the Teaching Workspace section from upstream", () => {
  expect(skill).toContain("## Teaching Workspace");
});

test("teach SKILL.md: carries the Philosophy section from upstream", () => {
  expect(skill).toContain("## Philosophy");
});

test("teach SKILL.md: carries the Fluency vs Storage Strength section from upstream", () => {
  expect(skill).toContain("Fluency vs Storage Strength");
});

test("teach SKILL.md: carries the Lessons section from upstream", () => {
  expect(skill).toContain("## Lessons");
});

test("teach SKILL.md: carries the Mission section from upstream", () => {
  expect(skill).toContain("## The Mission");
});

test("teach SKILL.md: carries the Zone of Proximal Development section from upstream", () => {
  expect(skill).toContain("## Zone Of Proximal Development");
});

test("teach SKILL.md: carries the Knowledge section from upstream", () => {
  expect(skill).toContain("## Knowledge");
});

test("teach SKILL.md: carries the Skills section from upstream", () => {
  expect(skill).toContain("## Skills");
});

test("teach SKILL.md: carries the NOTES.md section from upstream", () => {
  expect(skill).toContain("## `NOTES.md`");
});

test("teach SKILL.md: references MISSION-FORMAT.md (upstream reference)", () => {
  expect(skill).toContain("MISSION-FORMAT.md");
});

test("teach SKILL.md: references LEARNING-RECORD-FORMAT.md (upstream reference)", () => {
  expect(skill).toContain("LEARNING-RECORD-FORMAT.md");
});

test("teach SKILL.md: references RESOURCES-FORMAT.md (upstream reference)", () => {
  expect(skill).toContain("RESOURCES-FORMAT.md");
});

// ── Assets section is the ONLY changed section ────────────────────────────────

test("teach SKILL.md: has ## Assets section", () => {
  expect(skill).toContain("## Assets");
});

test("teach SKILL.md: Assets section names the bundled component collection", () => {
  const assetsIdx = skill.indexOf("## Assets");
  const nextSection = skill.indexOf("\n## ", assetsIdx + 1);
  const assetsSection =
    nextSection === -1
      ? skill.slice(assetsIdx)
      : skill.slice(assetsIdx, nextSection);
  expect(assetsSection).toMatch(/component|visual-teach\.md|catalog/i);
});

test("teach SKILL.md: Assets section carries floor-not-ceiling note", () => {
  const assetsIdx = skill.indexOf("## Assets");
  const nextSection = skill.indexOf("\n## ", assetsIdx + 1);
  const assetsSection =
    nextSection === -1
      ? skill.slice(assetsIdx)
      : skill.slice(assetsIdx, nextSection);
  expect(assetsSection).toMatch(/floor.*ceil|ceil.*floor/i);
});

test("teach SKILL.md: Assets section points at visual-teach.md catalog", () => {
  const assetsIdx = skill.indexOf("## Assets");
  const nextSection = skill.indexOf("\n## ", assetsIdx + 1);
  const assetsSection =
    nextSection === -1
      ? skill.slice(assetsIdx)
      : skill.slice(assetsIdx, nextSection);
  expect(assetsSection).toContain("visual-teach.md");
});

// ── Per-component seeding instruction ─────────────────────────────────────────

test("teach SKILL.md: seeding instruction always includes base", () => {
  expect(skill).toMatch(/base\.css|base\/base/i);
  expect(skill).toMatch(/base\.js|base\/base/i);
});

test("teach SKILL.md: seeding is per-component (not blanket copy of all assets)", () => {
  expect(skill).toMatch(
    /per.component|each component.*seed|seed.*each component|component.*use.*copy|used component/i
  );
});

test("teach SKILL.md: seeding instruction places files flat into workspace ./assets/", () => {
  expect(skill).toContain("./assets/");
});

test("teach SKILL.md: seeding describes math component pulls katex", () => {
  expect(skill).toMatch(/math.*katex|katex.*math/i);
});

test("teach SKILL.md: seeding describes code component pulls prism", () => {
  expect(skill).toMatch(/code.*prism|prism.*code/i);
});

test("teach SKILL.md: seeding describes diagram component pulls mermaid", () => {
  expect(skill).toMatch(/diagram.*mermaid|mermaid.*diagram/i);
});

test("teach SKILL.md: seeding says base is always seeded (lesson 1)", () => {
  expect(skill).toMatch(/always|every.*lesson|first lesson|lesson 1/i);
});

// ── Bundled assets under the skill ────────────────────────────────────────────

const bundledAssets = join(skillDir, "assets");

test("bundled assets directory exists under the skill", () => {
  expect(existsSync(bundledAssets)).toBe(true);
});

test("bundled assets: base/base.css exists", () => {
  expect(existsSync(join(bundledAssets, "base/base.css"))).toBe(true);
});

test("bundled assets: base/base.js exists", () => {
  expect(existsSync(join(bundledAssets, "base/base.js"))).toBe(true);
});

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
  test(`bundled assets: components/${name}/${name}.css exists`, () => {
    expect(
      existsSync(join(bundledAssets, "components", name, `${name}.css`))
    ).toBe(true);
  });
}

const JS_COMPONENTS = ["quiz", "checklist", "code", "diagram", "math"];
for (const name of JS_COMPONENTS) {
  test(`bundled assets: components/${name}/${name}.js exists`, () => {
    expect(
      existsSync(join(bundledAssets, "components", name, `${name}.js`))
    ).toBe(true);
  });
}

test("bundled assets: katex/ directory exists (for math seeding)", () => {
  expect(existsSync(join(bundledAssets, "katex"))).toBe(true);
});

test("bundled assets: prism/ directory exists (for code seeding)", () => {
  expect(existsSync(join(bundledAssets, "prism"))).toBe(true);
});

test("bundled assets: mermaid.js exists (for diagram seeding)", () => {
  expect(existsSync(join(bundledAssets, "mermaid.js"))).toBe(true);
});

test("bundled assets: visual-teach.md catalog exists", () => {
  expect(existsSync(join(bundledAssets, "visual-teach.md"))).toBe(true);
});

// ── Upstream format files bundled alongside ───────────────────────────────────

test("MISSION-FORMAT.md exists alongside SKILL.md", () => {
  expect(existsSync(join(skillDir, "MISSION-FORMAT.md"))).toBe(true);
});

test("RESOURCES-FORMAT.md exists alongside SKILL.md", () => {
  expect(existsSync(join(skillDir, "RESOURCES-FORMAT.md"))).toBe(true);
});

test("LEARNING-RECORD-FORMAT.md exists alongside SKILL.md", () => {
  expect(existsSync(join(skillDir, "LEARNING-RECORD-FORMAT.md"))).toBe(true);
});

test("GLOSSARY-FORMAT.md exists alongside SKILL.md", () => {
  expect(existsSync(join(skillDir, "GLOSSARY-FORMAT.md"))).toBe(true);
});
