---
name: visual-teach
description: Rich interactive blocks for teaching lessons — quizzes with feedback, persisted checklists, callouts, annotated code, themeable styling. Use when authoring, building, or improving a teaching lesson's HTML (especially with the `/teach` skill): emit `vt-*` blocks linked to shared assets instead of inlining per-lesson CSS/JS.
when_to_use: Whenever a teaching lesson HTML file is being written or edited — a `/teach` lesson, or any standalone lesson. Reach for it the moment you would otherwise inline a quiz, checklist, callout, or lesson stylesheet.
---

# visual-teach

**Seeding — first action:** copy all assets into the workspace in one shot:

```sh
cp -R "<this skill's assets dir>"/* ./assets/
```

Use the skill base directory announced when this skill loads; do **not** hardcode a developer checkout path. Then open **`assets/visual-teach.md`** — the catalog lists every block with a "reach for when…" trigger, the page shell for new lessons, and linking instructions.

**Floor, not a ceiling:** `vt-*` covers commodity parts. When the lesson's win is to _produce or manipulate_ something live (write a regex, flex a layout), build a bespoke exercise in `./assets/` alongside the `vt-*` blocks — don't settle for a quiz that only tests recognition.
