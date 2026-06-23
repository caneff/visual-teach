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

test("SKILL.md: reference pointer instructs to open only needed blocks", () => {
  expect(skill).toMatch(/open only.*block|block.*you need|only the block/i);
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

// ── type="module" hardening — assertions preserved against the index ──
test(`index: warns that type="module" breaks file:// delivery`, () => {
  expect(cheatsheet).toMatch(
    /type="module".*break|break.*type="module"|do not.*type="module"|type="module".*do not|never.*type="module"|type="module".*never|plain.*script.*not.*module|not.*module/i
  );
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

// ── Block menu: every entry resolves to an existing file ──────
const BLOCK_FILES = [
  "blocks/callouts.md",
  "blocks/code-io.md",
  "blocks/tables-pills-keys.md",
  "blocks/quizzes-checklist.md",
  "blocks/diagrams.md",
  "blocks/math.md",
  "blocks/teacher-box.md",
];

for (const file of BLOCK_FILES) {
  test(`block menu: index links to existing file ${file}`, () => {
    expect(existsSync(join(root, "assets", file))).toBe(true);
    expect(cheatsheet).toContain(file);
  });
}

// ── Selective-load instruction ────────────────────────────────
test("index: carries selective-load / open-only-what-you-need instruction", () => {
  expect(cheatsheet).toMatch(
    /open only.*block|only.*block.*you need|load.*only|selective.*load/i
  );
});

// ── vt-* classes documented in their block files ──────────────
const CLASS_TO_FILE = {
  "vt-callout": "blocks/callouts.md",
  "vt-level": "blocks/callouts.md",
  "vt-code": "blocks/code-io.md",
  "vt-static": "blocks/code-io.md",
  "vt-io": "blocks/code-io.md",
  "vt-table": "blocks/tables-pills-keys.md",
  "vt-kv": "blocks/tables-pills-keys.md",
  "vt-pill": "blocks/tables-pills-keys.md",
  "vt-badge": "blocks/tables-pills-keys.md",
  "vt-kbd": "blocks/tables-pills-keys.md",
  "vt-quiz": "blocks/quizzes-checklist.md",
  "vt-checklist": "blocks/quizzes-checklist.md",
  "vt-diagram": "blocks/diagrams.md",
  "vt-flow": "blocks/diagrams.md",
  "vt-flex": "blocks/diagrams.md",
  "vt-split": "blocks/diagrams.md",
  "vt-mermaid": "blocks/diagrams.md",
  "vt-math": "blocks/math.md",
  "vt-eq": "blocks/math.md",
  "vt-pcode": "blocks/math.md",
  "vt-teacher": "blocks/teacher-box.md",
};

for (const [cls, file] of Object.entries(CLASS_TO_FILE)) {
  test(`${cls} is documented in assets/${file}`, () => {
    const content = readFileSync(join(root, "assets", file), "utf8");
    expect(content).toContain(cls);
  });
}

// ── Quiz option guidance — now lives in quiz block file ───────
const quizBlock = readFileSync(
  join(root, "assets/blocks/quizzes-checklist.md"),
  "utf8"
);

test("quiz block: quiz section allows uniform inline code in options", () => {
  expect(quizBlock).toMatch(/uniform/i);
});

test("quiz block: quiz section forbids spelling out punctuation", () => {
  expect(quizBlock).toMatch(/spell.*punct|punct.*spell|don.t spell/i);
});

test("quiz block: quiz section retains equal-length visible text guidance", () => {
  expect(quizBlock).toMatch(
    /same length|equal length|roughly.*length|length.*roughly/i
  );
});

// ── Theming overrides — live in the index ─────────────────────
test("cheatsheet: theming example uses a flat :root block", () => {
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
