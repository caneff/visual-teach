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

- [`demo/adoption-demos/index.html`](./demo/adoption-demos/index.html) — a
  side-by-side gallery: six subjects (git rebase, flexbox, TLS, regex, Bayes,
  music), each taught twice from the same spec, **control vs treatment**. The
  treatment arm reached for visual-teach on its own every time.
- [`demo/showcase.html`](./demo/showcase.html) — every component on one page,
  auto-generated from the per-component demos.

Run `npm run serve` and open either page (the gallery's iframes are happiest
over `http://`).

## What you get

- [`skills/visual-teach/assets/base/base.css`](./skills/visual-teach/assets/base/base.css) + each component's CSS style every `vt-*` block from
  9 themeable color tokens. They work in light and dark, and print cleanly.
- [`skills/visual-teach/assets/base/base.js`](./skills/visual-teach/assets/base/base.js) is the always-linked spine (theme bridge/toggle,
  section anchors); each component ships its own plain UMD/IIFE script that wires
  its block — quizzes with per-option feedback, checklists that persist to
  `localStorage`, copy buttons on code blocks, Prism syntax highlighting. (Not ES
  modules — they load over `file://` without CORS.)
- [`skills/visual-teach/assets/visual-teach.md`](./skills/visual-teach/assets/visual-teach.md) is the component catalog, the index of all
  components and how to use them. Read it before authoring.
- [`skills/visual-teach/assets/prism/`](./skills/visual-teach/assets/prism/) holds the bundled Prism grammars (HTML, CSS, JS, Python, SQL,
  Bash) used for code highlighting.
- [`skills/visual-teach/assets/mermaid.js`](./skills/visual-teach/assets/mermaid.js) is an opt-in bridge for computed graphs (sequence, state,
  ER) that inherit the lesson's theme.

## Components

The catalog covers the full set. A sample: page shell (kicker, lede, metabar,
objectives, recap), callouts, tables (including key/value glossaries), pills and
badges, persisted checklists, single- and multi-select quizzes, annotated code
blocks, inline token emphasis, a CSS diagram vocabulary (nodes, flow, rows,
splits, a flex playground), and a source/footer card set.

## Skills

| Skill                        | Role                                                                                                                                            |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `skills/visual-teach/`       | **This skill.** `SKILL.md` + `assets/`; the unit `npx skills add` installs. Invoked before `/teach` so lessons have rich `vt-*` blocks.         |
| `.claude/skills/teach-base/` | **Frozen A/B control.** Pristine upstream `/teach` minus the invocation flag. Never edit — modifications silently invalidate prior comparisons. |

See `docs/ab-comparison-methodology.md` for how to run a quality A/B comparison.

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
