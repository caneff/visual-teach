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
const checklist = readFileSync(join(root, "course-tests/CHECKLIST.md"), "utf8");
const findings = readFileSync(join(root, "course-tests/FINDINGS.md"), "utf8");

// ── teach-course SKILL.md: probe methodology guard ───────────────────────────

test("teach-course SKILL.md: states probe may only exercise blocks the skill emits", () => {
  expect(teachCourseSkill).toMatch(
    /only.*block.*skill.*emit|only.*emit|only test.*block.*emit|probe.*only.*blocks.*skill.*generat|only.*blocks.*skill.*actually/i
  );
});

test("teach-course SKILL.md: prohibits hand-rolling placeholder content", () => {
  expect(teachCourseSkill).toMatch(/hand.roll|placeholder.*content|fabricat/i);
});

test("teach-course SKILL.md: defines valid missing-component finding", () => {
  expect(teachCourseSkill).toMatch(/missing.*component|gap/i);
});

test("teach-course SKILL.md: states no-demand → no-gap rule", () => {
  expect(teachCourseSkill).toMatch(
    /no.*demand.*no.*gap|no.*gap.*no.*demand|demand/i
  );
});

// ── course-tests/CHECKLIST.md ────────────────────────────────────────────────

test("course-tests/CHECKLIST.md exists", () => {
  expect(existsSync(join(root, "course-tests/CHECKLIST.md"))).toBe(true);
});

test("course-tests/CHECKLIST.md: carries the no-placeholder guard", () => {
  expect(checklist).toMatch(/hand.roll|placeholder.*content|fabricat/i);
});

test("course-tests/CHECKLIST.md: states probe only exercises blocks the skill generates", () => {
  expect(checklist).toMatch(
    /only.*block.*skill|block.*skill.*emit|block.*skill.*generat/i
  );
});

// ── course-tests/FINDINGS.md ─────────────────────────────────────────────────

test("course-tests/FINDINGS.md exists", () => {
  expect(existsSync(join(root, "course-tests/FINDINGS.md"))).toBe(true);
});

test("course-tests/FINDINGS.md: annotates image-gap finding as retracted or manufactured", () => {
  expect(findings).toMatch(/retract|manufactured|invalid|fabricat/i);
});

test("course-tests/FINDINGS.md: cross-references issue #86", () => {
  expect(findings).toContain("#86");
});

test("course-tests/FINDINGS.md: cross-references issue #87", () => {
  expect(findings).toContain("#87");
});
