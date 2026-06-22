import { test, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");

const cheatsheet = readFileSync(join(root, "assets/visual-teach.md"), "utf8");

const skill = readFileSync(join(root, "SKILL.md"), "utf8");
const beforeHtml = readFileSync(
  join(root, "demo/cron-0001-before.html"),
  "utf8"
);
const afterHtml = readFileSync(join(root, "demo/cron-0001-after.html"), "utf8");

// ── SKILL.md structure ─────────────────────────────────────────
test("SKILL.md: documents the Convert action", () => {
  expect(skill).toContain("Convert existing lessons");
});

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

test("SKILL.md: Convert mentions :root override for topic colors", () => {
  expect(skill).toContain(":root");
});

// ── Demo conversion exercise files ────────────────────────────
test("demo/cron-0001-before.html exists", () => {
  expect(existsSync(join(root, "demo/cron-0001-before.html"))).toBe(true);
});

test("demo/cron-0001-after.html exists", () => {
  expect(existsSync(join(root, "demo/cron-0001-after.html"))).toBe(true);
});

test("before: has inline <style>", () => {
  expect(beforeHtml).toContain("<style>");
});

test("before: has inline <script>", () => {
  expect(beforeHtml).toContain("<script>");
});

test("before: does not link visual-teach.css", () => {
  expect(beforeHtml).not.toContain("visual-teach.css");
});

test("after: links visual-teach.css", () => {
  expect(afterHtml).toContain("visual-teach.css");
});

test("after: links visual-teach.js", () => {
  expect(afterHtml).toContain("visual-teach.js");
});

test("after: no inline checklist JS", () => {
  expect(afterHtml).not.toMatch(/<script>\s*\/\*.*?checklist/s);
});

test("after: no inline quiz JS", () => {
  expect(afterHtml).not.toMatch(/<script>\s*\/\*.*?quiz/s);
});

for (const cls of [
  "vt-kicker",
  "vt-lede",
  "vt-metabar",
  "vt-num",
  "vt-callout",
  "vt-table",
  "vt-code",
  "vt-checklist",
  "vt-quiz",
  "vt-recap",
  "vt-sources",
]) {
  test(`after: contains class ${cls}`, () => {
    expect(afterHtml).toContain(cls);
  });
}

test("after: topic colors in :root override", () => {
  expect(afterHtml).toContain(":root");
});

test("after: sets --vt-accent token in :root", () => {
  expect(afterHtml).toContain("--vt-accent");
});

for (const phrase of [
  "Reading a cron expression",
  "The five fields",
  "every value of this field",
  "Open your crontab",
  "Timezone trap",
  "crontab(5)",
]) {
  test(`after: preserves teaching phrase "${phrase}"`, () => {
    expect(afterHtml).toContain(phrase);
  });
}

// ── type="module" hardening (issue #92) ───────────────────────
test(`SKILL.md: warns that type="module" breaks file:// delivery`, () => {
  expect(skill).toMatch(
    /type="module".*break|break.*type="module"|do not.*type="module"|type="module".*do not|never.*type="module"|type="module".*never|plain.*script.*not.*module|not.*module/i
  );
});

test(`SKILL.md: Convert step strips type="module" from visual-teach.js tag`, () => {
  expect(skill).toMatch(
    /strip.*type="module"|remove.*type="module"|type="module".*strip|type="module".*remov/i
  );
});

test(`SKILL.md: script snippet does not include type="module" on visual-teach.js`, () => {
  const scriptTagMatch = skill.match(/<script[^>]*visual-teach\.js[^>]*>/);
  expect(scriptTagMatch).not.toBeNull();
  expect(scriptTagMatch[0]).not.toContain('type="module"');
});

test(`cheatsheet: warns against type="module" on visual-teach.js script`, () => {
  expect(cheatsheet).toMatch(
    /type="module".*break|break.*type="module"|do not.*type="module"|not.*type="module"|type="module".*not|plain.*script|not.*ES module|CORS/i
  );
});

test(`after: visual-teach.js script tag has no type="module"`, () => {
  const scriptTagMatch = afterHtml.match(/<script[^>]*visual-teach\.js[^>]*>/);
  expect(scriptTagMatch).not.toBeNull();
  expect(scriptTagMatch[0]).not.toContain('type="module"');
});

// ── visual-teach.md quiz option guidance ──────────────────────
test("cheatsheet: quiz section allows uniform inline code in options", () => {
  expect(cheatsheet).toMatch(/uniform/i);
});

test("cheatsheet: quiz section forbids spelling out punctuation", () => {
  expect(cheatsheet).toMatch(/spell.*punct|punct.*spell|don.t spell/i);
});

test("cheatsheet: quiz section retains equal-length visible text guidance", () => {
  expect(cheatsheet).toMatch(
    /same length|equal length|roughly.*length|length.*roughly/i
  );
});

// ── Theming dark-mode fix (issue #93) ────────────────────────────
test("cheatsheet: theming example uses a flat :root block (Part B — single override works)", () => {
  const themingSection = cheatsheet.slice(cheatsheet.indexOf("## Theming"));
  expect(themingSection).toMatch(/:root\s*\{[^}]*--vt-accent/);
});

test("cheatsheet: theming section explains that vt dark rules win via higher specificity so a flat override is safe", () => {
  const themingSection = cheatsheet.slice(cheatsheet.indexOf("## Theming"));
  expect(themingSection).toMatch(
    /higher.?specificity|:root\[data-theme|spec.*0,2,0|0,2,0/i
  );
});

test("cheatsheet: theming section lists which tokens vt re-sets in dark mode", () => {
  const themingSection = cheatsheet.slice(cheatsheet.indexOf("## Theming"));
  expect(themingSection).toMatch(/--vt-accent.*--vt-ink|--vt-ink.*--vt-accent/);
  expect(themingSection).toMatch(/dark mode|theme-varying/i);
});
