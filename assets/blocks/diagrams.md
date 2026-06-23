# Diagram vocabulary

All CSS, no JS, prints, light + dark.

## Panel — `vt-diagram`

```html
<div class="vt-diagram">
  <!-- nodes, flow, rows, splits go here -->
  <p class="vt-diagram-caption">Optional figure caption.</p>
</div>
```

## Inline SVG — hand-drawn diagrams (force, geometry, stick figures)

Place raw `<svg>` directly inside `.vt-diagram`. Draw strokes and fills with
`currentColor` (or a `var(--vt-*)` token) — **never hardcoded hex**. The
`.vt-diagram svg` rule sets `color: var(--vt-ink)`, so `currentColor` resolves
to the correct foreground in both light and dark mode automatically.

```html
<div class="vt-diagram">
  <svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
    <circle
      cx="30"
      cy="30"
      r="20"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    />
    <line
      x1="50"
      y1="30"
      x2="90"
      y2="30"
      stroke="currentColor"
      stroke-width="2"
    />
  </svg>
  <p class="vt-diagram-caption">
    Fig — force diagram (currentColor scales with theme)
  </p>
</div>
```

## Node / box — `vt-node` / `vt-box`

Labeled card. Add `.em` for accent emphasis, `.muted` for secondary. Inline
`<sup>` and `<sub>` are safe inside a node.

```html
<span class="vt-node">Step</span>
<span class="vt-node em">Key step</span>
<span class="vt-box muted">Optional</span>
<span class="vt-node">β<sup>2</sup></span>
<span class="vt-node">H<sub>2</sub>O</span>
```

## Flow — `vt-flow` — auto `→` connectors between direct children

**Sequence only** — injects a `→` before each sibling. For layout demos
(`justify-content` / `align-items`) use `vt-flex` below, not this.

```html
<div class="vt-flow">
  <span class="vt-node">Source</span>
  <span class="vt-node">Transform</span>
  <span class="vt-node em">Output</span>
</div>
```

## Flex playground — `vt-flex` / `vt-flex-item` (layout behavior demos)

Pure `display:flex`, no injected separators.

`justify-content` modifiers: `jc-start` `jc-end` `jc-center` `jc-between` `jc-around` `jc-evenly`
`align-items` modifiers: `ai-start` `ai-end` `ai-center` `ai-stretch`

```html
<div class="vt-flex jc-between">
  <span class="vt-flex-item">A</span>
  <span class="vt-flex-item">B</span>
  <span class="vt-flex-item">C</span>
</div>
```

Stack several labeled blocks to compare values side by side:

```html
<p class="sc-sub">jc-between</p>
<div class="vt-flex jc-between">
  <span class="vt-flex-item">A</span>
  <span class="vt-flex-item">B</span>
  <span class="vt-flex-item">C</span>
</div>
<p class="sc-sub">jc-evenly</p>
<div class="vt-flex jc-evenly">
  <span class="vt-flex-item">A</span>
  <span class="vt-flex-item">B</span>
  <span class="vt-flex-item">C</span>
</div>
```

## Row / col — `vt-row` / `vt-col` — lane layout

```html
<div class="vt-row">
  <div class="vt-col">
    <span class="vt-col-label">Input</span>
    <span class="vt-node">CSV</span>
    <span class="vt-node">API</span>
  </div>
  <div class="vt-col">
    <span class="vt-col-label">Process</span>
    <span class="vt-node em">Transform</span>
  </div>
</div>
```

`vt-row` wraps by default. Add `.nowrap` to keep columns on one line and scroll
horizontally — for a row that must read as a single unit, e.g. cron fields:

```html
<div class="vt-row nowrap">…</div>
```

## Split — `vt-split` — before / after

Add `.before` / `.after` on panels for colour cues. `vt-code` is safe inside
`vt-split` panels — long lines scroll horizontally within the block.

```html
<div class="vt-split">
  <div class="vt-split-panel before">
    <div class="vt-split-label">Before</div>
    …
  </div>
  <div class="vt-split-panel after">
    <div class="vt-split-label">After</div>
    …
  </div>
</div>
```

## Computed graphs — `vt-mermaid` — opt-in mermaid (sequence / state / ER only)

**Default to the CSS diagram vocabulary above** — prints, offline, zero JS. Use
mermaid **only** when the graph needs auto-layout: sequence, state, ER.

```html
<!-- 1. Add the bridge script (after visual-teach.js, or just before </body>) -->
<script src="../assets/mermaid.js"></script>

<!-- 2. Write your diagram inside .vt-mermaid — mermaid CDN loads only if this
     element is found on the page. -->
<div class="vt-mermaid">
  sequenceDiagram Client->>Server: Request Server-->>Client: Response
</div>
```

The bridge reads the 9 `--vt-*` tokens at render time and maps them to
mermaid's `themeVariables`, so diagrams match the lesson palette and switch
automatically with dark mode.
