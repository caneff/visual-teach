# visual-teach

A component library for teaching lessons: one stylesheet
([`assets/visual-teach.css`](./assets/visual-teach.css)) and one script ([`assets/visual-teach.js`](./assets/visual-teach.js)) that give
lesson HTML a consistent look and interactive behavior through `vt-*` CSS
classes. Think Bootstrap for lessons, not a renderer or a framework.

It does not own a lesson format, a schema, or any pedagogy. That is the job of
the [`/teach`](./.claude/skills/teach/) skill — the owned fork of the
[upstream `/teach`](https://github.com/mattpocock/skills) that bundles the
component library and seeding rules directly.

## What you get

- [`assets/visual-teach.css`](./assets/visual-teach.css) styles every `vt-*` block from 9 themeable color
  tokens. It works in light and dark, and prints cleanly.
- [`assets/visual-teach.js`](./assets/visual-teach.js) is an ES module that wires up the interactive blocks:
  quizzes with per-option feedback, checklists that persist to `localStorage`,
  copy buttons on code blocks, auto-injected section anchors, and Prism syntax
  highlighting.
- [`assets/visual-teach.md`](./assets/visual-teach.md) is the component catalog, the index of all
  components and how to use them. Read it before authoring.
- [`assets/prism/`](./assets/prism/) holds the bundled Prism grammars (HTML, CSS, JS, Python, SQL,
  Bash) used for code highlighting.
- [`assets/mermaid.js`](./assets/mermaid.js) is an opt-in bridge for computed graphs (sequence, state,
  ER) that inherit the lesson's theme.

## Components

The catalog covers the full set. A sample: page shell (kicker, lede, metabar,
objectives, recap), callouts, tables (including key/value glossaries), pills and
badges, persisted checklists, single- and multi-select quizzes, annotated code
blocks, inline token emphasis, a CSS diagram vocabulary (nodes, flow, rows,
splits, a flex playground), and a source/footer card set.

## Skills

| Skill                         | Role                                                                                                                                            |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `.claude/skills/teach/`       | **The authoring skill.** Owned fork of upstream `/teach` with the component library bundled and per-component seeding built in.                 |
| `.claude/skills/teach-base/`  | **Frozen A/B control.** Pristine upstream `/teach` minus the invocation flag. Never edit — modifications silently invalidate prior comparisons. |
| `scripts/derive-treatment.sh` | **A/B treatment twin.** Generates an invocable copy of `teach` (minus `disable-model-invocation`) for side-by-side quality comparisons.         |

See `docs/ab-comparison-methodology.md` for how to run a quality A/B comparison.

## Usage

Link the assets in each lesson (paths relative to `lessons/`):

```html
<link rel="stylesheet" href="../assets/visual-teach.css" />
<!-- ... lesson body ... -->
<script src="../assets/visual-teach.js"></script>
```

The `/teach` skill seeds the assets into a new workspace on its first run and
authors lessons with `vt-*` blocks per the catalog.

## Tests

```sh
npm test   # vitest run: quiz, checklist, code block, mermaid,
           # css classes, and asset-isolation behavior
```

## Repository layout

- [`assets/`](./assets/) — the component library (CSS, JS, catalog, per-component dirs, Prism, mermaid bridge).
- [`tests/`](./tests/) — vitest suites for the interactive blocks.
- [`docs/PRD.md`](./docs/PRD.md) — the project spec; [`docs/adr/`](./docs/adr/) — architectural decisions.
- [`CONTEXT.md`](./CONTEXT.md) — the glossary, the project's shared vocabulary.
- [`AGENTS.md`](./AGENTS.md) — the contributor guide.
