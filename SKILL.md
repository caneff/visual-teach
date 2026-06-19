---
name: visual-teach
description: Rich interactive blocks for teaching lessons — quizzes with feedback, persisted checklists, callouts, annotated code, themeable styling. Use when authoring, building, or improving a teaching lesson's HTML (especially with the `/teach` skill): emit `vt-*` blocks linked to shared assets instead of inlining per-lesson CSS/JS. Also converts/retrofits existing lesson HTML to these blocks.
when_to_use: Whenever a teaching lesson HTML file is being written or edited — a `/teach` lesson, or any standalone lesson. Reach for it the moment you would otherwise inline a quiz, checklist, callout, or lesson stylesheet.
---

# visual-teach

A passive component library for teaching lessons: one stylesheet
(`assets/visual-teach.css`) + one script (`assets/visual-teach.js`) that supply
look and behavior via `vt-*` CSS classes. It does **not** own a lesson format, a
schema, or pedagogy. It is an **add-on to `/teach`** (mattpocock/skills) — it does
not replace it. Authoring a real course is `/teach`'s job; visual-teach only makes
the lesson HTML rich and consistent.

The full authoring reference is **`assets/visual-teach.md`** (the cheatsheet).
Read it before emitting blocks.

## When composing inside a `/teach` lesson

If you are authoring a lesson (the workspace has `MISSION.md`, `lessons/`, etc.):

1. **Ensure assets exist.** If `./assets/visual-teach.{css,js,md}` are missing in
   the workspace, copy them there from this skill's `assets/` directory.
2. **Author with `vt-*` blocks** per `assets/visual-teach.md`, linking the two
   assets — do **not** inline a per-lesson `<style>`/`<script>`.

## The Convert verb (explicit `/visual-teach`)

This is visual-teach's only explicit action. Given existing lesson HTML:

- **Lessons present** (`/visual-teach [file|all]`): retrofit each lesson — ensure
  `./assets/` has the three files, strip the inline `<style>`/`<script>`, swap the
  classes to `vt-*` per the cheatsheet, add the two asset links. Preserve all
  content; this is a mechanical edit. Topic-specific colors → move into a
  `:root` override in the lesson `<head>`, not into `visual-teach.css`.
- **No lessons (seed-only):** just copy `./assets/visual-teach.{css,js,md}` into
  the workspace and tell the user the workspace is seeded — now run `/teach`.

## No `/teach` installed

If asked to author a lesson from scratch and `/teach` is not available, do not
reimplement teaching. Point the user to install it
(`mattpocock/skills`, `skills/productivity/teach`), then return. (Converting
existing lessons does not require `/teach`.)
