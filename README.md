# visual-teach

A component library for teaching lessons: a Base spine
([`skills/visual-teach/assets/base/base.css`](./skills/visual-teach/assets/base/base.css) + [`skills/visual-teach/assets/base/base.js`](./skills/visual-teach/assets/base/base.js))
plus a collection of self-contained, copyable components that give lesson HTML a
consistent look and interactive behavior through `vt-*` CSS classes. There is no
aggregate bundle — a lesson links Base and only the components it uses. Think
Bootstrap for lessons, not a renderer or a framework.

It does not own a lesson format, a schema, or any pedagogy. That is the job of
the upstream [`/teach`](https://github.com/mattpocock/skills) skill
(`mattpocock/skills`, `skills/productivity/teach`). visual-teach seeds reusable
components into the workspace and then steps back; `/teach` authors the lessons.

## Install

Install the skill into your coding agent with the [`skills`](https://skills.sh) CLI:

```sh
npx skills add caneff/visual-teach
```

That copies the skill — its `SKILL.md` and bundled `assets/` — into your agent's
skills directory (`.claude/skills/visual-teach/` for Claude Code, and the
equivalent for other agents). Nothing else in this repo ships: the demos, tests,
and docs stay here for reading, not for installing. Once installed, `/teach` (or
any lesson author) has the `vt-*` blocks on hand, and the skill seeds its assets
into each new lesson workspace.

## See it

- [**Adoption gallery**](https://caneff.github.io/visual-teach/demo/adoption-demos/index.html) — a
  side-by-side gallery: six subjects (git rebase, flexbox, TLS, regex, Bayes,
  music), each taught twice from the same spec. The left lesson was generated
  without visual-teach, the right one with it.
- [**Component showcase**](https://caneff.github.io/visual-teach/demo/showcase.html) — every component on one page,
  auto-generated from the per-component demos.

These are served live via GitHub Pages, so the links above open as real,
rendered pages. To browse locally instead, run `npm run serve` (the gallery's
iframes are happiest over `http://`).

## What you get

Lessons pick up a consistent, themeable look and ready-made interactive blocks
without hand-rolling CSS or JS each time: quizzes with per-option feedback,
checklists that remember their state across reloads, code blocks with copy
buttons and syntax highlighting, callouts, comparison tables, a CSS diagram
vocabulary, and math rendering. Everything themes to light and dark, prints
cleanly, and runs straight from `file://` with no build step.

See the [**component showcase**](https://caneff.github.io/visual-teach/demo/showcase.html)
for the full set on one page.

## Skills

| Skill                  | Role                                                                                                                                    |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `skills/visual-teach/` | **This skill.** `SKILL.md` + `assets/`; the unit `npx skills add` installs. Invoked before `/teach` so lessons have rich `vt-*` blocks. |

## Usage

Link the assets in each lesson (paths relative to `lessons/`):

```html
<link rel="stylesheet" href="../assets/base/base.css" />
<link rel="stylesheet" href="../assets/components/quiz/quiz.css" />
<!-- ...one <link> per component the lesson uses... -->
<!-- ... lesson body ... -->
<script src="../assets/base/base.js"></script>
<script src="../assets/components/quiz/quiz.js"></script>
<!-- ...one <script> per interactive component... -->
```

The `/teach` skill seeds the assets into a new workspace on its first run and
authors lessons with `vt-*` blocks per the catalog.

## Tests

```sh
npm test   # vitest run: quiz, checklist, code block, mermaid,
           # css classes, and asset-isolation behavior
```

## Repository layout

- [`skills/visual-teach/`](./skills/visual-teach/) — the installable skill: `SKILL.md` plus the component library under `assets/` (CSS, JS, catalog, per-component dirs, Prism, mermaid bridge).
- [`.claude-plugin/plugin.json`](./.claude-plugin/plugin.json) — plugin manifest declaring the skill for the `skills` / Claude Code marketplace ecosystem.
- [`demo/`](./demo/) — worked example lessons, the before/after gallery (`adoption-demos/`), and the component `showcase.html`. Browse-only; not part of the installed skill.
- [`tests/`](./tests/) — vitest suites for the interactive blocks.
- [`docs/PRD.md`](./docs/PRD.md) — the project spec; [`docs/adr/`](./docs/adr/) — architectural decisions.
- [`CONTEXT.md`](./CONTEXT.md) — the glossary, the project's shared vocabulary.
- [`AGENTS.md`](./AGENTS.md) — the contributor guide.
