import { test, expect } from "vitest";
import { readFileSync, existsSync, rmSync } from "fs";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import os from "os";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");

const teachSkillFile = join(root, ".claude/skills/teach/SKILL.md");
const harnessDocFile = join(root, "docs/ab-comparison-methodology.md");
const deriveScript = join(root, "scripts/derive-treatment.sh");
const contextFile = join(root, "CONTEXT.md");

const teachSkill = readFileSync(teachSkillFile, "utf8");
const harnessDoc = readFileSync(harnessDocFile, "utf8");
const context = readFileSync(contextFile, "utf8");

// ── derive script ─────────────────────────────────────────────────────────────

test("derive script exists at scripts/derive-treatment.sh", () => {
  expect(existsSync(deriveScript)).toBe(true);
});

test("derive script is executable", () => {
  const result = execSync(`test -x ${deriveScript} && echo ok`, {
    encoding: "utf8",
  }).trim();
  expect(result).toBe("ok");
});

// ── derived twin is byte-identical except the flag ────────────────────────────

test("derive script produces twin whose SKILL.md matches teach except the disable-model-invocation line", () => {
  const tmpDir = join(os.tmpdir(), "vt-test-treatment-twin");
  rmSync(tmpDir, { recursive: true, force: true });
  execSync(`bash ${deriveScript} ${tmpDir}`, { encoding: "utf8" });
  const twinSkill = readFileSync(join(tmpDir, "SKILL.md"), "utf8");
  const expected = teachSkill
    .split("\n")
    .filter((l) => !/^disable-model-invocation:/.test(l))
    .join("\n");
  expect(twinSkill).toBe(expected);
  rmSync(tmpDir, { recursive: true, force: true });
});

test("derived twin has no disable-model-invocation line", () => {
  const tmpDir = join(os.tmpdir(), "vt-test-treatment-twin-flag");
  rmSync(tmpDir, { recursive: true, force: true });
  execSync(`bash ${deriveScript} ${tmpDir}`, { encoding: "utf8" });
  const twinSkill = readFileSync(join(tmpDir, "SKILL.md"), "utf8");
  expect(twinSkill).not.toMatch(/^disable-model-invocation:/m);
  rmSync(tmpDir, { recursive: true, force: true });
});

test("derived twin preserves all other frontmatter from teach", () => {
  const tmpDir = join(os.tmpdir(), "vt-test-treatment-twin-fm");
  rmSync(tmpDir, { recursive: true, force: true });
  execSync(`bash ${deriveScript} ${tmpDir}`, { encoding: "utf8" });
  const twinSkill = readFileSync(join(tmpDir, "SKILL.md"), "utf8");
  expect(twinSkill).toMatch(/^name:\s*teach\s*$/m);
  expect(twinSkill).toMatch(/^effort:\s*high\s*$/m);
  rmSync(tmpDir, { recursive: true, force: true });
});

test("derived twin copies bundled assets from teach", () => {
  const tmpDir = join(os.tmpdir(), "vt-test-treatment-twin-assets");
  rmSync(tmpDir, { recursive: true, force: true });
  execSync(`bash ${deriveScript} ${tmpDir}`, { encoding: "utf8" });
  expect(existsSync(join(tmpDir, "assets"))).toBe(true);
  expect(existsSync(join(tmpDir, "assets/base/base.css"))).toBe(true);
  rmSync(tmpDir, { recursive: true, force: true });
});

// ── harness doc documents both arms ──────────────────────────────────────────

test("harness doc names the treatment arm", () => {
  expect(harnessDoc).toMatch(/treatment/i);
});

test("harness doc states treatment arm carries the component library", () => {
  expect(harnessDoc).toMatch(
    /treatment.*component|component.*treatment|treatment.*visual.teach|visual.teach.*treatment/i
  );
});

test("harness doc names the control arm as teach-base", () => {
  expect(harnessDoc).toMatch(/control.*teach.base|teach.base.*control/i);
});

test("harness doc documents the one-step derive command", () => {
  expect(harnessDoc).toMatch(/derive-treatment|disable-model-invocation/i);
});

test("harness doc states same spec to both arms", () => {
  expect(harnessDoc).toMatch(
    /same spec|identical spec|same.*prompt|identical.*prompt/i
  );
});

// ── CONTEXT.md glossary has treatment twin entry ──────────────────────────────

test("CONTEXT.md has treatment-twin glossary entry", () => {
  expect(context).toMatch(/treatment.twin|treatment twin/i);
});
