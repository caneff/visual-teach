import { test, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");

const teachCourseSkill = readFileSync(
  join(root, ".claude/skills/teach-course/SKILL.md"),
  "utf8"
);
const adrPath = join(
  root,
  "docs/adr/0003-probe-methodology-and-deliberate-non-components.md"
);
const adr = readFileSync(adrPath, "utf8");
const teachBaseSkillPath = join(root, ".claude/skills/teach-base/SKILL.md");
const teachBaseSkill = readFileSync(teachBaseSkillPath, "utf8");

// ── teach-course SKILL.md: probe methodology guard ───────────────────────────

test("teach-course SKILL.md: states probe may only exercise blocks the skill emits", () => {
  expect(teachCourseSkill).toContain("A probe may only exercise");
});

test("teach-course SKILL.md: prohibits hand-rolling placeholder content", () => {
  expect(teachCourseSkill).toContain("hand-roll placeholder content");
});

test("teach-course SKILL.md: defines valid missing-component finding", () => {
  expect(teachCourseSkill).toContain('"missing component" finding is valid');
});

test("teach-course SKILL.md: states no-demand → no-gap rule", () => {
  expect(teachCourseSkill).toContain("there is no gap — there is no demand");
});

test("teach-course SKILL.md: points at the methodology ADR", () => {
  expect(teachCourseSkill).toMatch(
    /0003-probe-methodology-and-deliberate-non-components/
  );
});

// ── docs/adr/0003: the durable methodology + non-component record ────────────

test("ADR 0003 exists", () => {
  expect(existsSync(adrPath)).toBe(true);
});

test("ADR 0003: carries the no-placeholder guard", () => {
  expect(adr).toContain("hand-roll placeholder content");
});

test("ADR 0003: states probe only exercises blocks the skill emits", () => {
  expect(adr).toContain("A probe may only exercise");
});

test("ADR 0003: records the retracted/removed image-component finding", () => {
  expect(adr).toContain("removed (#86)");
});

test("ADR 0003: lists the deliberate non-components (plot, numeric input)", () => {
  expect(adr).toMatch(/XY plot/i);
  expect(adr).toMatch(/free-text quiz/i);
});

// ── teach-base: frozen A/B control baseline ──────────────────────────────────

test("teach-base skill file exists", () => {
  expect(existsSync(teachBaseSkillPath)).toBe(true);
});

test("teach-base SKILL.md: name frontmatter is teach-base", () => {
  expect(teachBaseSkill).toMatch(/^name:\s*teach-base/m);
});

test("teach-base SKILL.md: documented as A/B control baseline — do not edit", () => {
  expect(teachBaseSkill).toContain("A/B control baseline");
  expect(teachBaseSkill).toContain("do not edit");
});

test("teach-base SKILL.md: contains no vt-* class references", () => {
  expect(teachBaseSkill).not.toMatch(/vt-[a-z]/);
});

test("teach-base SKILL.md: seeds no assets (no ./assets/ seeding instruction)", () => {
  expect(teachBaseSkill).not.toMatch(/cp -R|seed.*asset|copy.*asset/i);
});

test("teach-course SKILL.md: references teach-base, not teach-test", () => {
  expect(teachCourseSkill).toContain("teach-base");
  expect(teachCourseSkill).not.toContain("teach-test");
});
