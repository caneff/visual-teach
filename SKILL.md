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

This is visual-teach's only explicit action. Before doing anything, read the
workspace to determine which of the three modes applies:

**Decision tree:**

1. **Authoring from scratch, no `/teach`** — if the user asked you to write a
   new lesson and `/teach` is not in the current skill context: do not author.
   Point the user to install `/teach` (`mattpocock/skills`,
   `skills/productivity/teach`) and stop. Converting existing lessons does not
   require `/teach`; this mode is authoring-only.

2. **No lessons present (seed-only)** — if no `lessons/` directory or `.html`
   lesson files exist yet:
   1. Copy `./assets/visual-teach.{css,js,md}` from this skill's `assets/`
      directory into the workspace's `./assets/` (create if missing).
   2. Tell the user the workspace is seeded and to now run `/teach`.
   3. Stop.

3. **Lessons present** (`/visual-teach [file|all]`) — one or more `.html`
   lesson files exist. Retrofit each targeted file:
   1. Ensure `./assets/visual-teach.{css,js,md}` exist; copy from skill if not.
   2. In the lesson `<head>`, extract any topic-specific color variables from
      the inline `<style>` and move them into a `<style>` `:root { }` override
      block (keep only the custom token values, not component styles).
   3. Remove the remaining inline `<style>` block entirely.
   4. Remove any inline `<script>` block(s).
   5. Add asset links (relative to the lesson's location, typically `lessons/`):
      ```html
      <link rel="stylesheet" href="../assets/visual-teach.css">
      ```
      and before `</body>` (visual-teach.js is an ES module — `type="module"`
      is required, or it throws `Unexpected token 'export'` and nothing wires up):
      ```html
      <script type="module" src="../assets/visual-teach.js"></script>
      ```
   6. Swap class names to their `vt-*` equivalents per `assets/visual-teach.md`.
      Preserve all semantic content, headings, body text, `data-*` attributes,
      and interactive markup — this is a mechanical class/asset edit, not a
      content edit.
   7. Report each file changed and confirm no content was removed.
