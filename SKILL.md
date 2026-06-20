---
name: visual-teach
description: Rich interactive blocks for teaching lessons — quizzes with feedback, persisted checklists, callouts, annotated code, themeable styling. Use when authoring, building, or improving a teaching lesson's HTML (especially with the `/teach` skill): emit `vt-*` blocks linked to shared assets instead of inlining per-lesson CSS/JS. Also converts/retrofits existing lesson HTML to these blocks.
when_to_use: Whenever a teaching lesson HTML file is being written or edited — a `/teach` lesson, or any standalone lesson. Reach for it the moment you would otherwise inline a quiz, checklist, callout, or lesson stylesheet.
---

# visual-teach

A passive component library for teaching lessons: one stylesheet
(`assets/visual-teach.css`) + one script (`assets/visual-teach.js`) that supply
look and behavior via `vt-*` CSS classes. It does **not** own a lesson format, a
schema, or pedagogy — that's `/teach`'s job (`mattpocock/skills`,
`skills/productivity/teach`). visual-teach only makes lesson HTML rich and
consistent. No `/teach` installed → there's nothing to enrich; install it first.

The authoring reference is **`assets/visual-teach.md`** (the cheatsheet). Read it
before emitting blocks.

**Authoring a new lesson:** don't assemble from scratch — start from the **Page
shell** block near the top of the cheatsheet (the canonical `<main>` skeleton:
metabar, objectives, sections, recap) plus the asset `<link>`/`<script>` snippet
above it, then fill it in and add blocks per the cheatsheet, deleting any you
don't need. Cloning a known-good shell avoids the common misses (wrong asset
paths, missing `type="module"`, dropped wrapper divs).

## How it reaches `/teach`

The reliable channel is the **filesystem**, not skill auto-invocation: once
`visual-teach.{css,js,md}` sit in a workspace's `./assets/`, `/teach` reuses them
by its own charter ("read `./assets/` and build from the components already
there"). So the one job that matters is **getting those three files into
`./assets/`** — then author with `vt-*` blocks per the cheatsheet, never inlining
a per-lesson `<style>`/`<script>`.

If `./assets/visual-teach.{css,js,md}` are missing, copy them there from this
skill's `assets/` directory. That's the seed. Do it before the first lesson, or
let Convert (below) do it on an existing one.

## Convert existing lessons (`/visual-teach [file|all]`)

Retrofit a lesson's HTML to `vt-*` blocks + shared assets. Mechanical edit — no
content changes. For each targeted file:

1. Ensure `./assets/visual-teach.{css,js,md}` exist; copy from this skill if not.
2. In the `<head>`, move any topic-specific color variables from the inline
   `<style>` into a `<style>` `:root { }` override block (keep only the custom
   token values, not component styles).
3. Remove the remaining inline `<style>` block entirely.
4. Remove any inline `<script>` block(s).
5. Add asset links (relative to the lesson, typically `lessons/`):
   ```html
   <link rel="stylesheet" href="../assets/visual-teach.css">
   ```
   and before `</body>` (visual-teach.js is an ES module — `type="module"` is
   required, or it throws `Unexpected token 'export'` and nothing wires up):
   ```html
   <script type="module" src="../assets/visual-teach.js"></script>
   ```
6. Swap class names to their `vt-*` equivalents per `assets/visual-teach.md`.
   Preserve all semantic content, headings, body text, `data-*` attributes, and
   interactive markup.
7. Report each file changed and confirm no content was removed.
