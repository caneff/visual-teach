---
name: visual-teach
description: Rich interactive blocks for teaching lessons — quizzes with feedback, persisted checklists, callouts, annotated code, themeable styling. Use when authoring, building, or improving a teaching lesson's HTML (especially with the `/teach` skill): emit `vt-*` blocks linked to shared assets instead of inlining per-lesson CSS/JS.
when_to_use: Whenever a teaching lesson HTML file is being written or edited — a `/teach` lesson, or any standalone lesson. Reach for it the moment you would otherwise inline a quiz, checklist, callout, or lesson stylesheet.
---

# visual-teach

A passive component library for teaching lessons: a Base spine
(`assets/base/base.css` + `assets/base/base.js`) plus copyable Components — no
aggregate bundle — that supply look and behavior via `vt-*` CSS classes. It does **not** own a lesson format, a
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

Invoke this skill before authoring lessons to seed reusable `vt-*` components
instead of inlining CSS/JS. Once the asset files sit in a workspace's
`./assets/`, `/teach` (upstream `mattpocock/skills`) discovers and reuses them
under its own "read `./assets/` and build from the components already there"
rule. The blocks are a **floor, not a ceiling**: keep building bespoke
`./assets/` components when a topic needs an interaction the catalog can't
express, so lessons don't turn samesy (see the index's "floor, not a ceiling"
note).

**Seeding is this skill's first action.** Source is **this skill's own bundled
`assets/` directory** — the `assets/` folder that ships alongside this `SKILL.md`
(for a normal global install, `~/.claude/skills/visual-teach/assets/`). Use the
skill base directory announced when this skill loads; do **not** hardcode a
developer checkout path.

## Per-component seeding

Seed components on demand — **never copy the entire bundled collection**. The
workspace `./assets/` receives only what the lesson actually uses, keeping a
no-math course free of KaTeX and a no-diagram course free of Mermaid.

**Always seed base on the first lesson:**

```sh
mkdir -p ./assets
cp "<this skill's base dir>/assets/base/base.css" ./assets/base.css
cp "<this skill's base dir>/assets/base/base.js"  ./assets/base.js
```

**For each component this lesson uses, copy its files flat into `./assets/`:**

| Component used | Copy from skill assets                               | Heavy dep also needed                |
| -------------- | ---------------------------------------------------- | ------------------------------------ |
| `callout`      | `components/callout/callout.css`                     | —                                    |
| `code`         | `components/code/code.css`, `code.js`                | `prism/` → `./assets/prism/`         |
| `table`        | `components/table/table.css`                         | —                                    |
| `chip`         | `components/chip/chip.css`                           | —                                    |
| `quiz`         | `components/quiz/quiz.css`, `quiz.js`                | —                                    |
| `checklist`    | `components/checklist/checklist.css`, `checklist.js` | —                                    |
| `diagram`      | `components/diagram/diagram.css`, `diagram.js`       | `mermaid.js` → `./assets/mermaid.js` |
| `math`         | `components/math/math.css`, `math.js`                | `katex/` → `./assets/katex/`         |
| `teacher-box`  | `components/teacher-box/teacher-box.css`             | —                                    |

**Example — lesson with callout + quiz (no math, no diagram):**

```sh
cp "<this skill's base dir>/assets/components/callout/callout.css" ./assets/callout.css
cp "<this skill's base dir>/assets/components/quiz/quiz.css"       ./assets/quiz.css
cp "<this skill's base dir>/assets/components/quiz/quiz.js"        ./assets/quiz.js
# ./assets/ now has: base.css base.js callout.css quiz.css quiz.js
# No katex/, no prism/, no mermaid.js
```

**Example — lesson with math:**

```sh
cp "<this skill's base dir>/assets/components/math/math.css" ./assets/math.css
cp "<this skill's base dir>/assets/components/math/math.js"  ./assets/math.js
cp -R "<this skill's base dir>/assets/katex" ./assets/katex
```

Reuse is the default, not the exception. Before authoring each lesson, check
`./assets/` — if a component's files are already there, link them directly. Only
copy what is missing.
