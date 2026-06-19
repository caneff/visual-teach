# visual-teach blocks — authoring cheatsheet

These two assets (`visual-teach.css`, `visual-teach.js`) style and animate a
lesson. **Link them in every lesson and use the `vt-*` classes below instead of
inlining your own CSS/JS.** Colors come from 9 themeable tokens — override them in
a workspace stylesheet or the lesson `<head>` to match the topic; never hardcode
hex.

Link in `<head>` / before `</body>` (relative to `lessons/`):

```html
<link rel="stylesheet" href="../assets/visual-teach.css">
<!-- ... -->
<script src="../assets/visual-teach.js"></script>
```

## Page shell
```html
<main>
  <p class="vt-kicker">Topic · Lesson 1</p>
  <h1>Lesson title</h1>
  <p class="vt-lede">One-sentence promise of the lesson.</p>
  <p class="vt-meta">⏱ ~15 min · Needs: …</p>
  <h2><span class="vt-num">1</span>Section heading</h2>
  …prose: plain p / ul / code / a, auto-themed…
</main>
```

## Callout — `tone` via class: (default warn) `info` `insight` `success` `risk`
```html
<div class="vt-callout insight"><strong>Why it matters:</strong> …</div>
```

## Table — bare `<table>` or `.vt-table`. Pill — `<span class="vt-pill">label</span>`.

## Checklist (persists in localStorage; progress + reset auto-injected)
`data-key` must be unique per lesson.
```html
<ol class="vt-checklist" data-key="topic-0001">
  <li><input type="checkbox"><div>
    <span class="vt-step-title">Step title</span>
    <span class="vt-step-body">What to do.</span>
  </div></li>
</ol>
```

## Quiz (reveals correct/wrong + feedback). `data-answer` = 0-based index.
Keep every option the same length — no formatting tells.
```html
<div class="vt-quiz" data-answer="1">
  <p class="q">Question?</p>
  <button class="opt">Option A</button>
  <button class="opt">Option B</button>
  <div class="feedback"></div>
  <template class="why-good">Shown when correct.</template>
  <template class="why-bad">Shown when wrong — explain the misconception.</template>
</div>
```

## Teacher box / sources footer
```html
<div class="vt-teacher"><strong>🎓 Stuck?</strong> Ask your teacher (the agent) …</div>
<footer class="vt-sources">Sources: <a href="…">…</a> · Lesson 0001</footer>
```

## Diagram vocabulary (all CSS, no JS, prints, light + dark)

### Panel
```html
<div class="vt-diagram">
  <!-- nodes, flow, rows, splits go here -->
  <p class="vt-diagram-caption">Optional figure caption.</p>
</div>
```

### Node / box — labeled card. Add `.em` for accent emphasis, `.muted` for secondary.
```html
<span class="vt-node">Step</span>
<span class="vt-node em">Key step</span>
<span class="vt-box muted">Optional</span>
```

### Flow — auto `→` connectors between direct children
```html
<div class="vt-flow">
  <span class="vt-node">Source</span>
  <span class="vt-node">Transform</span>
  <span class="vt-node em">Output</span>
</div>
```

### Row / col — lane layout
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

### Split — before / after. Add `.before` / `.after` on panels for colour cues.
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

## Theming — override any of the 9 tokens in the lesson `<head>`:
```html
<style>:root{ --vt-accent:#0d7d4d; --vt-ink:#11181c; }</style>
```
Tokens: `--vt-ink --vt-muted --vt-accent --vt-accent-fg --vt-rule --vt-paper
--vt-good --vt-bad --vt-warn`. Topic-specific colors (e.g. a product's own UI
palette) belong here, not in `visual-teach.css`.
