# visual-teach

A passive component library for teaching lessons: one stylesheet
(`assets/visual-teach.css`) and one script (`assets/visual-teach.js`) that give
lesson HTML a consistent look and interactive behavior through `vt-*` CSS
classes. Think Bootstrap for lessons, not a renderer or a framework.

It does not own a lesson format, a schema, or any pedagogy. That is the job of
the [`/teach`](https://github.com/mattpocock/skills) skill
(`skills/productivity/teach`), which visual-teach is an add-on to. visual-teach
only supplies the look and the interactive behavior for the lesson HTML that
`/teach` produces. With no `/teach` installed there is nothing to enrich, so
install it first.

## What you get

- `assets/visual-teach.css` styles every `vt-*` block from 9 themeable color
  tokens. It works in light and dark, and prints cleanly.
- `assets/visual-teach.js` is an ES module that wires up the interactive blocks:
  quizzes with per-option feedback, checklists that persist to `localStorage`,
  copy buttons on code blocks, auto-injected section anchors, and Prism syntax
  highlighting.
- `assets/visual-teach.md` is the authoring cheatsheet, the single source of
  truth for which blocks exist and how to write them. Read it before authoring.
- `assets/prism/` holds the bundled Prism grammars (HTML, CSS, JS, Python, SQL,
  Bash) used for code highlighting.
- `assets/mermaid.js` is an opt-in bridge for computed graphs (sequence, state,
  ER) that inherit the lesson's theme.

## Blocks

The cheatsheet covers the full set. A sample: page shell (kicker, lede, metabar,
objectives, recap), callouts, tables (including key/value glossaries), pills and
badges, persisted checklists, single- and multi-select quizzes, annotated code
blocks, inline token emphasis, a CSS diagram vocabulary (nodes, flow, rows,
splits, a flex playground), and a source/footer card set.

## Usage

visual-teach reaches `/teach` through the **filesystem**, not skill
auto-invocation. Once the asset files sit in a workspace's `./assets/`, `/teach`
reuses them by its own charter ("read `./assets/` and build from the components
already there"). So the only setup step that matters is getting the assets into
`./assets/`, then authoring with `vt-*` blocks per the cheatsheet instead of
inlining per-lesson CSS or JS.

Link the assets in each lesson (paths relative to `lessons/`):

```html
<link rel="stylesheet" href="../assets/visual-teach.css" />
<!-- ... lesson body ... -->
<script type="module" src="../assets/visual-teach.js"></script>
```

`visual-teach.js` is an ES module, so `type="module"` is required, and the page
must be served over HTTP. ES modules do not load over `file://`, so until you
serve the page the quizzes and checklists stay inert.

```sh
npm run serve   # python3 -m http.server 8000, from the repo root
# then open http://localhost:8000/<path>/lessons/<file>.html
```

### Two modes

- **Compose**: visual-teach is active in the agent's context during a `/teach`
  authoring run, so the lesson is born using `vt-*` blocks. This is triggered by
  model auto-invocation and is not guaranteed (see `docs/adr/`).
- **Convert** (`/visual-teach [file|all]`): retrofit an existing lesson's HTML to
  `vt-*` blocks and shared assets. It seeds the assets, strips inline
  `<style>`/`<script>`, swaps class names, and links the assets. A mechanical
  edit, with no content changes.

## Tests

```sh
npm test   # vitest run: quiz, checklist, code block, mermaid,
           # css classes, and asset-isolation behavior
```

## Repository layout

- `assets/` — the shipped library (CSS, JS, cheatsheet, Prism, mermaid bridge).
- `tests/` — vitest suites for the interactive blocks.
- `docs/PRD.md` — the project spec; `docs/adr/` — architectural decisions.
- `CONTEXT.md` — the glossary, the project's shared vocabulary.
- `AGENTS.md` — the contributor guide. One rule to flag: a block change must
  update the cheatsheet in the same change.

## Keeping the cheatsheet in sync

`assets/visual-teach.md` is the contract authors read. When you add, rename, or
change the markup of a block in the CSS or JS, update the cheatsheet in the same
change. A block that ships without a cheatsheet entry does not exist as far as
lesson authors are concerned.
