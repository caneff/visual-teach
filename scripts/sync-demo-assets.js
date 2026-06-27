#!/usr/bin/env node
// Mirror each adoption demo's copy of the shared visual-teach assets from the
// canonical `assets/` tree.
//
// The demos under `demo/adoption-demos/*/visual-teach/` are committed real files
// (not symlinks) so the gallery renders everywhere it gets hosted — GitHub Pages,
// raw URLs, and Windows clones all choke on symlinks. The cost of real copies is
// drift: a demo's vendored `base.css`, KaTeX, etc. silently fall behind canonical.
// This script re-copies them, and CI runs it then `git diff --exit-code`s, so a
// drifted demo fails the build instead of shipping.
//
// Rule: refresh only files that have a canonical counterpart; never add and never
// delete. Demos carry bespoke per-lesson assets nested among the shared ones
// (e.g. components/bayes-calc/, sequencer.js, course.css) that have no canonical
// match — those are real lesson content and must survive untouched. The authoring
// catalog `visual-teach.md` is the one deletion: no lesson links it, so it rots.

import { cpSync, rmSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const canonical = join(repo, "skills/visual-teach/assets");

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

const demosRoot = join(repo, "demo", "adoption-demos");
const subjects = readdirSync(demosRoot).filter((s) =>
  statSync(join(demosRoot, s)).isDirectory()
);

let refreshed = 0;
for (const subject of subjects) {
  const assets = join(demosRoot, subject, "visual-teach", "assets");
  if (!existsSync(assets)) continue;

  rmSync(join(assets, "visual-teach.md"), { force: true });

  // Refresh every demo file that canonical also has; leave bespoke files alone.
  for (const file of walk(assets)) {
    const rel = relative(assets, file); // e.g. components/quiz/quiz.css
    const src = join(canonical, rel);
    if (existsSync(src)) {
      cpSync(src, file);
      refreshed++;
    }
  }
}

console.log(
  `synced ${refreshed} shared asset files across ${subjects.length} demos`
);
