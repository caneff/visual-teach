import { test, expect } from "vitest";
import { readFileSync, existsSync, readdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");

const adrDir = join(root, "docs/adr");
const adrFiles = readdirSync(adrDir);

const readme = readFileSync(join(root, "README.md"), "utf8");
const context = readFileSync(join(root, "CONTEXT.md"), "utf8");
const skill = readFileSync(join(root, "SKILL.md"), "utf8");
const prd = readFileSync(join(root, "docs/PRD.md"), "utf8");
const harnessDoc = readFileSync(
  join(root, "docs/ab-comparison-methodology.md"),
  "utf8"
);

// ── probe-adoption.sh removed ─────────────────────────────────────────────────

test("probe-adoption.sh is removed", () => {
  expect(existsSync(join(root, "scripts/probe-adoption.sh"))).toBe(false);
});

// ── ADR 0006: fork decision recorded ─────────────────────────────────────────

test("an ADR exists recording the owned-fork decision", () => {
  const hasForkAdr = adrFiles.some((f) => {
    const content = readFileSync(join(adrDir, f), "utf8");
    return /owned.fork|fork.*decision|fork.*own|own.*fork/i.test(content);
  });
  expect(hasForkAdr).toBe(true);
});

test("ADR 0002 status is superseded", () => {
  const adr0002 = readFileSync(join(adrDir, "0002-add-on-not-fork.md"), "utf8");
  expect(adr0002).toMatch(/Status:\s*superseded/i);
});

// ── No add-on framing in current-facing docs ──────────────────────────────────

test("README.md: no 'add-on' framing", () => {
  expect(readme).not.toMatch(/\badd-on\b/i);
});

test("CONTEXT.md: no 'add-on' framing in glossary entries", () => {
  // ADR references allowed; glossary definitions must not describe visual-teach as an add-on
  expect(context).not.toMatch(/\badd-on skill\b/i);
  expect(context).not.toMatch(/\badd-on to \/teach\b/i);
});

test("SKILL.md: no 'add-on' framing", () => {
  expect(skill).not.toMatch(/\badd-on\b/i);
});

test("docs/PRD.md: no 'add-on' framing", () => {
  expect(prd).not.toMatch(/\badd-on\b/i);
});

// ── No filesystem-channel framing ─────────────────────────────────────────────

test("README.md: no 'filesystem channel' language", () => {
  expect(readme).not.toMatch(/filesystem channel/i);
});

test("SKILL.md: no 'filesystem channel' language", () => {
  expect(skill).not.toMatch(/filesystem channel/i);
});

test("docs/PRD.md: no 'filesystem channel' language", () => {
  expect(prd).not.toMatch(/filesystem channel/i);
});

// ── No Compose/Convert mode framing ──────────────────────────────────────────

test("README.md: no two-mode (Compose/Convert) framing", () => {
  expect(readme).not.toMatch(/\*\*Compose\*\*/);
  expect(readme).not.toMatch(/\*\*Convert\*\*/);
  expect(readme).not.toMatch(/Two modes/i);
});

test("CONTEXT.md: no 'Compose (mode)' entry", () => {
  expect(context).not.toMatch(/\*\*Compose \(mode\)\*\*/);
});

test("CONTEXT.md: no 'Compose-only' framing on visual-teach entry", () => {
  expect(context).not.toMatch(/\*\*Compose-only:\*\*/);
});

// ── ab-comparison doc: adoption apparatus removed, quality arm kept ───────────

test("ab-comparison doc: references teach as treatment skill", () => {
  expect(harnessDoc).toMatch(/teach\b/i);
  expect(harnessDoc).toMatch(/teach-base/i);
});

test("ab-comparison doc: no symlink-delete isolation apparatus", () => {
  expect(harnessDoc).not.toMatch(/symlink.*(delet|remov)|delet.*symlink/i);
  expect(harnessDoc).not.toMatch(/clean.room/i);
});

test("ab-comparison doc: no adoption-framing sections", () => {
  expect(harnessDoc).not.toMatch(/adoption/i);
});

// ── CONTEXT.md: new vocabulary ────────────────────────────────────────────────

test("CONTEXT.md: has **Component** glossary entry", () => {
  expect(context).toMatch(/\*\*Component\*\*/);
});

test("CONTEXT.md: has **Base** glossary entry", () => {
  expect(context).toMatch(/\*\*Base\*\*/);
});

test("CONTEXT.md: has **Catalog** glossary entry", () => {
  expect(context).toMatch(/\*\*Catalog\*\*/);
});

test("CONTEXT.md: has **chip** glossary entry (inline-marker component name)", () => {
  expect(context).toMatch(/\*\*chip\*\*/i);
});

test("CONTEXT.md: has **demo-as-doc** glossary entry", () => {
  expect(context).toMatch(/\*\*demo-as-doc\*\*/i);
});

test("CONTEXT.md: no **Block** glossary entry (retired)", () => {
  expect(context).not.toMatch(/\*\*Block\*\*/);
});

// ── No dangling teach-test references ─────────────────────────────────────────

test("CONTEXT.md: no teach-test references", () => {
  expect(context).not.toContain("teach-test");
});

test("README.md: no teach-test references", () => {
  expect(readme).not.toContain("teach-test");
});
