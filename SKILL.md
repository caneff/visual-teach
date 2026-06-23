---
name: visual-teach
description: Rich interactive blocks for teaching lessons — quizzes with feedback, persisted checklists, callouts, annotated code, themeable styling. Use when authoring, building, or improving a teaching lesson's HTML (especially with the `/teach` skill): emit `vt-*` blocks linked to shared assets instead of inlining per-lesson CSS/JS.
when_to_use: Whenever a teaching lesson HTML file is being written or edited — a `/teach` lesson, or any standalone lesson. Reach for it the moment you would otherwise inline a quiz, checklist, callout, or lesson stylesheet.
---

# visual-teach

A passive component library for teaching lessons: one stylesheet
(`assets/visual-teach.css`) + one script (`assets/visual-teach.js`) that supply
look and behavior via `vt-*` CSS classes. It does **not** own a lesson format, a
schema, or pedagogy — that's `/teach`'s job (`mattpocock/skills`,
`skills/productivity/teach`). visual-teach only makes lesson HTML rich and
consistent. No `/teach` installed → there's nothing to enrich; install it first.

The authoring reference is **`assets/visual-teach.md`** (the index). Read the
index first, then open only the block files the lesson needs — the index's block
menu lists each cluster with a "reach for when…" trigger. Do not open all block
files; loading everything at once is what produces stamped, same-chrome lessons.

**Authoring a new lesson:** start from the **Page shell** in the index — the
structural `<main>` skeleton (header, asset links, recap) only, not a complete
lesson with fixed slots to fill. Then compose the body from the block menu,
opening only the block files you need. Cloning the shell gives you the accepted
consistent header without dragging in optional pedagogical chrome.

## How it reaches `/teach`

`/teach` consumes the components from the **filesystem**: once the asset files
sit in a workspace's `./assets/`, `/teach` reuses them by its own charter ("read
`./assets/` and build from the components already there"). So the one job that
matters is **getting those files into `./assets/`** — then author with `vt-*`
blocks per the index, never inlining a per-lesson `<style>`/`<script>`. The
blocks are a **floor, not a ceiling**: keep building bespoke `./assets/`
components when a topic needs an interaction the catalog can't express, so lessons
don't turn samesy (see the index's "floor, not a ceiling" note).

**Seeding is this skill's first action.** When this skill is active during a
`/teach` authoring or extension turn and the workspace `./assets/` lacks the
library, copy the assets in from **this skill's own bundled `assets/` directory**
— the `assets/` folder that ships alongside this `SKILL.md` in the skill's base
directory (for a normal global install, `~/.claude/skills/visual-teach/assets/`).
Use the skill base directory announced when this skill loads; do **not** hardcode
a developer checkout path. From the workspace root:

```sh
mkdir -p ./assets
cp -R "<this skill's base dir>/assets/." ./assets/
```

Do this before the first lesson.
