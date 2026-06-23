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
  expect(adr).toMatch(/hand.roll|placeholder.*content|fabricat/i);
});

test("ADR 0003: states probe only exercises blocks the skill emits", () => {
  expect(adr).toMatch(
    /only.*block.*skill|block.*skill.*emit|block.*skill.*actually emit|blocks.*skill.*generat/i
  );
});

test("ADR 0003: records the retracted/removed image-component finding", () => {
  expect(adr).toMatch(/retract|manufactured|removed|empty/i);
  expect(adr).toContain("#86");
});

test("ADR 0003: lists the deliberate non-components (plot, numeric input)", () => {
  expect(adr).toMatch(/xy.?plot|chart/i);
  expect(adr).toMatch(/numeric|free.?text/i);
});
