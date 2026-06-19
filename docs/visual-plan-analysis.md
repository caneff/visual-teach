# Visual-Plan Component System — Comprehensive Analysis

Goal of this document: inventory every component the `/visual-plan` skill uses to
build its rich interactive output, so we can decide whether to (a) reconfigure
`/teach` to emit lessons through the same rendering system, or (b) call
`/visual-plan` (and its underlying tools) directly when authoring new lessons.

Sources: the installed skill at `~/.agents/skills/visual-plan/` (SKILL.md +
four reference files) and the **live block registry**, fetched no-auth with
`npx @agent-native/core@latest plan blocks` (20 block types, both `--format
reference` and `--format schema`). The registry is the authoritative list — the
skill itself never hard-codes the tags; it calls `get-plan-blocks` at author
time.

---

## 1. What the system actually is

`/visual-plan` does not render anything itself. It produces a **structured
document** — a JSON runtime model with an MDX authoring/export surface — that is
rendered by the Agent-Native Plan app (hosted at `plan.agent-native.com`, or a
local bridge in local-files mode). So "the components" live in three distinct
layers:

| Layer | What it is | Authoring surface |
| --- | --- | --- |
| **A. Document blocks** | The 20+ block types that make up the scrollable plan body | `plan.mdx` (capitalized MDX tags) |
| **B. Canvas surface** | The optional top visual review area — artboards, annotations, connectors | `canvas.mdx` |
| **C. Wireframe / prototype content** | The HTML (or legacy kit-tree) *inside* a wireframe artboard | `html` string or `<Screen>` kit nodes |

A plan = `plan.mdx` (always) + optional `canvas.mdx` + optional `prototype.mdx`
+ optional `.plan-state.json`. The whole thing round-trips: JSON is canonical at
runtime, MDX is the repo-friendly form, and `export-visual-plan` emits HTML +
Markdown fallback + JSON + MDX.

---

## 2. Layer A — Document blocks (the live registry, 20 types)

Every block is a capitalized MDX component. Blocks take **no `title`** — to give
one a heading you place a `rich-text` block with a `###` heading directly above
it. Every component must be self-closing (`<Code id=... data={{...}} />`) or have
a matching closing tag; a bare opening tag breaks the MDX parse.

| type | MDX tag | key data fields | purpose |
| --- | --- | --- | --- |
| `rich-text` | `<RichText>` | markdown body | Plan prose: bold/italic/code/links, nested lists, `###` headings. The base block. |
| `annotated-code` | `<AnnotatedCode>` | `filename?`, `language?`, `code`, `annotations?` | Line-numbered code walkthrough; each annotation `{lines:"12-18", label?, note}` anchors a margin note. **The preferred "file map" block.** |
| `code` | `<Code>` | `code`, `language?`, `filename?`, `caption?`, `maxLines?` | One syntax-highlighted snippet, collapse-to-N lines, language switcher + copy. |
| `code-tabs` | `<CodeTabs>` | `tabs` | **Deprecated** — use a `tabs` block with `code` children. |
| `diff` | `<Diff>` | `filename?`, `language?`, `before`, `after`, `mode?`, `annotations?` | GitHub-style before/after diff, unified or split, with side-anchored annotations. |
| `diagram` | `<Diagram>` | `html?`, `css?`, `caption?`, `nodes?`, `edges?`, `notes?` | Flexible inline architecture/data-flow diagram. **Prefer `html`/`css`** with `.diagram-*` primitives + `--wf-*` tokens; legacy `nodes`/`edges` only for tiny previews. |
| `mermaid` | `<Mermaid>` | `source`, `caption?` | Mermaid flowchart/sequence — only when textual grammar beats a spatial layout. |
| `data-model` | `<DataModel>` | `entities`, `relations?` | ERD / dbdiagram: entity cards with typed fields (PK/FK/nullable) + interactive FK relations. |
| `api-endpoint` | `<Endpoint>` | `method`, `path`, `summary?`, `params?`, `request?`, `responses?`, `auth?`, `deprecated?`, `change?` | Swagger-style single endpoint; colored method pill, expands to params/body/per-status responses. |
| `openapi-spec` | `<OpenApi>` | `spec`, `title?` | Whole-document Redoc/Swagger-UI reference from a full OpenAPI 3 / Swagger 2 JSON. |
| `json-explorer` | `<Json>` | `json`, `title?`, `collapsedDepth?` | Collapsible devtools/Postman JSON tree, type-colored values. |
| `file-tree` | `<FileTree>` | `title?`, `entries` | VS Code-style file/change tree from slash-paths; per-file change badges (added/modified/removed/renamed), notes, snippets. |
| `table` | `<Table>` | `columns`, `rows`, `density?` | Header columns + string rows. |
| `checklist` | `<Checklist>` | `items` (each `{id, label, note?, checked?}`) | Toggleable items. |
| `callout` | `<Callout>` | `tone?`, `body` | Emphasized note. Tones: **info / decision / risk / warning / success**. |
| `columns` | `<Columns>` / `<Column>` | `columns` (each holds nested blocks) | Side-by-side container for before/after, current/target. Authored as `<Columns><Column label="Before">…</Column>…</Columns>`. |
| `tabs` | `<TabsBlock>` | `tabs`, `orientation?` | Top or side tab container; each tab holds its own block list. The standard primitive for grouping multiple files/diffs/states. Placement: block **and inline**. |
| `question-form` | `<QuestionForm>` | `questions`, `submitLabel?` | Interactive form. Question `mode`: **single / multi / freeform**; options carry `recommended?`, optional `wireframe`/`diagram` previews. The one home for "Open Questions." |
| `visual-questions` | `<VisualQuestions>` | `questions`, `submitLabel?` | **Deprecated** — same shape as `question-form`. |
| `custom-html` | `<HtmlBlock>` | `html`, `css?`, `caption?` | Bounded escape hatch: one HTML fragment in a sandboxed iframe. No `html/head/body/script` tags. Discouraged for normal plans. |
| `wireframe` | `<WireframeBlock>` | `surface`, `renderMode?`, `caption?`, `skeleton?`, `html?`, `css?`, `screen?` | A single-screen mockup (HTML or legacy kit tree) in a chosen surface frame. **The bridge into Layer C.** |

**Deprecated (renderers retained for old plans, do not author new):** `code-tabs`,
`visual-questions`, and the legacy `implementation-map`.

---

## 3. Layer B — Canvas surface components

The canvas is the optional top review area (used for UI/product plans, omitted
for architecture/backend/data plans). It is authored in `canvas.mdx` from these
MDX components:

- `<DesignBoard>` — the board root.
- `<Section>` — a grouping region on the board.
- `<Artboard>` — a placed frame. Carries an `html` wireframe or references a
  wireframe block by `blockId`. Footprint is locked by `surface`; board-level
  `x`/`y` is allowed (and used to create lanes), but never artboard width/height.
- `<Screen>` — the wireframe content inside an artboard (see Layer C).
- `<Annotation>` — plain-text designer note anchored by `targetId` +
  `placement` (top/right/bottom/left). Types: default/`note` (gutter-parked),
  and the freeform-only `callout`/`text`/`arrow` markup layers.
- `<Connector>` — an arrow between neighboring artboards, for **real sequences
  only**.

Key constraints (from `references/canvas.md`): mixed surfaces lay out in lanes
with ≥96px gaps; no overlapping annotations; never a titled artboard with empty
interior; UI mockups live on the canvas, not in document `custom-html`.

---

## 4. Layer C — Wireframe content

### 4.1 HTML mockups (the current way)

A wireframe's `data.html` is a **self-contained semantic HTML fragment** — the
renderer owns theme, footprint, the Excalifont hand-drawn font, and the rough.js
sketch overlay. You never write `<html>/<body>/<style>/<script>` or
width/height/coordinates. The styling vocabulary is:

**Surface presets** (`surface`, required): `browser`, `desktop`, `mobile`,
`popover`, `panel`. `renderMode`: `wireframe` (default) or `design`.
`skeleton: true` for loading states.

**Helper classes** (renderer auto-themes bare `h1/h2/h3/p/button/input/a/hr`):
- `.wf-card` / `.wf-box` — bordered, padded container.
- `.wf-pill` / `.wf-chip` — rounded tag/filter; `.accent` for accent-filled.
- `.wf-muted` — secondary text (or `<small>`).
- `button.primary` / `[data-primary]` — accent-filled primary button.
- `.wf-icon` — sizes a rendered icon to surrounding text.

**Icons** — empty markers replaced by Tabler-style SVGs:
`<span data-icon="mail"></span>`. Supported names: `mail`/`email`,
`lock`/`password`, `search`, `plus`/`add`, `x`/`close`, `check`, `chevronDown`,
`chevronUp`, `chevronLeft`, `chevronRight`, `dots`/`more`,
`chevron`/`caret`/`dropdown`, `user`, `settings`, `calendar`, `bell`, `send`,
`edit`, `arrowLeft`, `arrowRight`.

**Color tokens** (never hex, never `font-family`): `--wf-ink`, `--wf-muted`,
`--wf-line`, `--wf-paper`, `--wf-card`, `--wf-accent`, `--wf-accent-fg`,
`--wf-accent-soft`, `--wf-warn`, `--wf-ok`, `--wf-radius`. These flip on
light/dark, which is the whole point of using them.

**Diagram HTML** uses a parallel vocabulary: `.diagram-panel`, `.diagram-card`,
`.diagram-node`, `.diagram-box`, `.diagram-pill`, `.diagram-muted`, plus
`[data-rough]` — same `--wf-*` tokens, sketchy mode swaps in Excalifont +
rough.js outlines.

### 4.2 Legacy kit-tree primitives (`<Screen>` children)

Old plans set a `screen` array of `{el, ...props}` kit nodes instead of `html`.
The renderer still displays them but **new plans must emit HTML, not these.**
The full `el` enum (29 primitives), captured for reference / migration:

`screen`, `browserBar`, `statusBar`, `toolbar`, `row`, `col`, `sidebar`,
`navItem`, `main`, `title`, `text`, `lines`, `section`, `taskRow`, `chips`,
`chip`, `pill`, `check`, `field`, `btn`, `fab`, `card`, `column`, `avatar`,
`iconSquare`, `kv`, `searchBar`, `box`, `divider`.

(These appear in the canvas/columns examples as MDX tags too: `<Screen>`,
`<Title>`, `<Btn>`, `<Pill>`, `<Row>`, `<Sidebar>`, `<NavItem>`, `<Main>`,
`<Lines>`, etc.)

### 4.3 Prototype screens

`content.prototype` holds the functional version of the same flow. Prototype
screens are semantic HTML with **`data-goto` attributes** wiring navigation
between steps. Same labels/ids as the canvas artboards.

---

## 5. The MCP tool surface (how blocks get created/edited)

Not components, but the API a `/teach` integration would call:

- **Create (mode-matched):** `create-visual-plan` (document-first),
  `create-ui-plan`, `create-prototype-plan`, `create-plan-design`,
  `create-visual-questions`, `convert-visual-plan-to-prototype`.
- **Catalog:** `get-plan-blocks` — call first, every time, for authoritative
  tags/fields. No-auth; sends no plan content.
- **Read:** `get-visual-plan`, `read-visual-plan-source`, `get-plan-feedback`.
- **Edit (surgical):** `update-visual-plan` with `contentPatches` —
  `patch-wireframe-html`, `patch-diagram-html`, `update-block`, `replace-blocks`,
  `update-canvas-annotation`, `update-rich-text`, etc.
- **Source-control edits:** `patch-visual-plan-source` /
  `import-visual-plan-source` against the MDX folder.
- **Export:** `export-visual-plan`.
- **Visibility:** `set-resource-visibility`, `share-resource`.

**Local-files / offline path** (relevant if `/teach` lessons should be repo
artifacts, not hosted): `plan blocks` → write `plans/<slug>/*.mdx` by hand →
`plan local check` → `plan local serve --kind plan|recap` → reports a localhost
bridge URL. No DB writes, no hosted publish, no comments/sharing.

---

## 6. Relevance to adapting `/teach`

Three realistic paths, cheapest first:

1. **Reuse only Layer A + C authoring conventions inside `/teach`'s own
   output.** If `/teach` already emits Markdown/MDX that some renderer shows,
   the highest-value borrow is the block vocabulary (`annotated-code`,
   `callout` tones, `tabs`, `question-form`, `diagram` with `--wf-*` tokens) and
   the wireframe styling system. No MCP dependency. Lessons gain interactive
   code walkthroughs, checks, and diagrams without adopting the Plan app.

2. **Call the Plan tools directly from `/teach`.** `/teach` plays the host-agent
   role: research the lesson, `get-plan-blocks`, then `create-visual-plan`
   (document-first — a lesson is closer to an architecture plan than a UI plan,
   so usually **no top canvas**). This gets the full hosted renderer + commenting
   for free but couples lessons to the Agent-Native Plan service and its
   "plan/recap" framing (a lesson is neither a plan nor a recap — the vocabulary
   leaks).

3. **Local-files mode** is the cleanest fit if lessons should be checked-in repo
   artifacts: author `plan.mdx` per lesson, serve via the local bridge, no hosted
   dependency. But it still renders through the Plan app's "plan" chrome.

**Caveats to weigh before committing:**
- The system is plan/recap-shaped. Several blocks (`api-endpoint`, `data-model`,
  `openapi-spec`, `file-tree`, `diff`) are dev-plan-centric and may be dead
  weight for teaching, while teaching-specific needs (quizzes with feedback,
  step-gated reveals, runnable code) aren't first-class — `question-form` is the
  closest to a quiz, and there's no native "run this code" cell.
- The renderer is **owned externally** (`@agent-native/core`); the skill
  explicitly says "fix the renderer, never hand-edit one plan." `/teach` can't
  change the renderer, only author within it.
- The deprecated/legacy churn (`code-tabs`, `visual-questions`,
  `implementation-map`, kit-tree) signals an actively moving target — pin the
  catalog via `get-plan-blocks` at author time rather than hard-coding tags.

**Recommendation (not yet acted on):** Path 1 is the lazy win — adopt the block
+ wireframe vocabulary as a teaching style guide and emit it from `/teach`
directly, without taking the MCP/hosted dependency, unless you specifically want
the hosted commenting/review loop for lessons. Decide based on whether lessons
need the interactive *review* surface (comments, anchors, approval) or just the
richer *presentation*.
