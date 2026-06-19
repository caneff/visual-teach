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
<script type="module" src="../assets/visual-teach.js"></script>
```

## Page shell
```html
<main>
  <p class="vt-kicker">Topic · Lesson 1</p>
  <h1>Lesson title</h1>
  <p class="vt-lede">One-sentence promise of the lesson.</p>

  <!-- Meta bar: time / prereqs / difficulty / lesson position -->
  <div class="vt-metabar">
    <span class="item">⏱ <strong>~15 min</strong></span>
    <span class="item">Needs: <strong>Lesson 1 complete</strong></span>
    <span class="item"><span class="vt-level intermediate">Intermediate</span></span>
    <span class="item">Lesson <strong>3</strong> of 9</span>
  </div>

  <!-- Objectives block -->
  <div class="vt-objectives">
    <p class="h">By the end of this lesson you'll be able to:</p>
    <ul>
      <li>First learning outcome</li>
      <li>Second learning outcome</li>
    </ul>
  </div>

  <!-- Mission tie-in -->
  <div class="vt-mission"><strong>Why this matters for your goal:</strong> …</div>

  <!-- Section heading with CSS-only hover anchor -->
  <h2><span class="vt-num">1</span>Section heading<a class="vt-anchor" href="#slug" aria-label="anchor">#</a></h2>
  …prose: plain p / ul / code / a, auto-themed…

  <!-- Primary-source card -->
  <div class="vt-source">
    <div><span class="h">Primary source</span>
      <a href="…">Source title</a> — one sentence on why this source.</div>
  </div>

  <!-- Recap + next-lesson CTA -->
  <div class="vt-recap">
    <p class="h">✦ What you earned</p>
    One sentence on what the learner can now do.
  </div>
  <p><a class="vt-cta" href="…">Next: Lesson title →</a></p>

  <!-- Prev / next lesson nav -->
  <nav class="vt-lessonnav">
    <a href="…">← Lesson N · Prev title</a>
    <span class="spacer"></span>
    <a href="…">Lesson N+2 · Next title →</a>
  </nav>
</main>
```

## Difficulty pill — `vt-level` (use inside `.vt-metabar` or standalone)
Modifier classes: `beginner` `intermediate` `advanced`
```html
<span class="vt-level intermediate">Intermediate</span>
```

## Callout — `tone` via class: (default warn) `info` `insight` `success` `risk`
```html
<div class="vt-callout insight"><strong>Why it matters:</strong> …</div>
```

## Table — bare `<table>` or `.vt-table`

```html
<!-- Responsive wrapper (always use for .vt-table) -->
<div class="vt-table-wrap">
  <table class="vt-table">
    <!-- header column: th[scope="row"] on each data row -->
    <thead><tr><th>Capability</th><th>Option A</th><th>Option B</th></tr></thead>
    <tbody>
      <tr><th scope="row">Scales</th><td class="vt-ok"></td><td class="vt-no"></td></tr>
      <tr class="vt-row-key"><th scope="row">Key row</th><td class="vt-partial"></td><td class="vt-ok"></td></tr>
    </tbody>
  </table>
</div>
<!-- Compact density: add class="vt-table compact" -->
<!-- Cell status: td.vt-ok (✓)  td.vt-no (✗)  td.vt-partial (~) -->
<!-- Recommended column: <col class="vt-col-pick"> + <span class="vt-pick-badge">Recommended</span> in th -->
```

Key/value reference table (glossary, config keys):
```html
<table class="vt-kv">
  <tr><th scope="row">Term</th><td>Definition</td></tr>
</table>
```

## Pills + level badges + keyboard keys

```html
<!-- Fills: (default accent)  neutral  good  bad  warn -->
<span class="vt-pill good">Done</span>
<!-- Outline: add class="outline" -->
<span class="vt-pill outline warn">Caution</span>
<!-- Size: add class="sm" -->
<!-- Status dot: add class="dot" -->
<span class="vt-pill outline good dot">Required</span>
<!-- Leading icon: add class="ic-check" or "ic-warn" -->
<span class="vt-pill good ic-check">Verified</span>

<!-- Difficulty pills -->
<span class="vt-level beginner">Beginner</span>
<span class="vt-level intermediate">Intermediate</span>
<span class="vt-level advanced">Advanced</span>

<!-- Step / count badge -->
<span class="vt-badge">3</span>

<!-- Keyboard keys -->
<kbd class="vt-kbd">Ctrl</kbd> + <kbd class="vt-kbd">K</kbd>
```

## Checklist (v1 — persists in localStorage; progress bar + count + reset auto-injected)
`data-key` must be unique per lesson.
```html
<ol class="vt-checklist" data-key="topic-0001">
  <li><input type="checkbox"><div>
    <span class="vt-step-title">Step title</span>
    <span class="vt-step-body">What to do.</span>
  </div></li>
</ol>
```
A11y: label association and `aria-valuenow` on the progress bar are auto-injected.

## Quiz (v1)
`data-answer` = 0-based index of the correct option.
Keep every option the same length — no formatting tells.

### Single-answer (default) — immediate reveal with per-option misconceptions
```html
<div class="vt-quiz" data-answer="1">
  <p class="q">Question?</p>
  <button class="opt">Option A</button>
  <button class="opt">Option B — correct</button>
  <button class="opt">Option C</button>
  <div class="feedback"></div>
  <template class="why-good">Shown after any answer — explains why correct.</template>
  <template class="why-bad">Fallback shown when wrong, no per-option template.</template>
  <template data-opt="0">Misconception for option A specifically.</template>
  <template data-opt="2">Misconception for option C specifically.</template>
  <div class="vt-quiz-live" aria-live="polite" aria-atomic="true"></div>
</div>
```
- `template[data-opt="N"]` — per-option misconception (0-indexed). Falls back to `template.why-bad`.
- `template.why-good` — always shown after answering (correct or wrong).
- `div.vt-quiz-live` — hidden aria-live region; include for screen-reader feedback.

### Try-again mode — add `data-try-again`
```html
<div class="vt-quiz" data-answer="1" data-try-again>
  …same interior…
</div>
```
Wrong clicks show feedback without revealing the answer or locking the quiz — the user keeps picking until correct.

### Multi-select — add `data-multi`, set `data-answer` to a comma-separated list
```html
<div class="vt-quiz" data-answer="0,2" data-multi>
  <p class="q">Pick all correct options.</p>
  <button class="opt">Correct A</button>
  <button class="opt">Wrong B</button>
  <button class="opt">Correct C</button>
  <div class="feedback"></div>
  <template class="why-good">A and C are correct because…</template>
  <div class="vt-quiz-live" aria-live="polite" aria-atomic="true"></div>
</div>
```
A "Check answer" button is auto-injected. Clicking options toggles selection (`aria-pressed`).

## Recap + next-CTA
```html
<div class="vt-recap">
  <p class="h">✦ What you earned</p>
  One-sentence summary of what the learner can now do.
</div>
<p><a class="vt-cta" href="next-lesson.html">Next: Topic name →</a></p>
```

## Teacher box (SVG cap icon, question chips, self-explanation prompt, community pointer)
```html
<div class="vt-teacher">
  <div>
    <p class="h">Stuck or curious? Your teacher is the agent that made this.</p>
    <p>Ask anything — follow-up questions are the point, not an interruption. Not sure where to start:</p>
    <div class="vt-asks">
      <span class="vt-ask">Why did X happen?</span>
      <span class="vt-ask">How does this map to Y?</span>
      <span class="vt-ask">Show me a harder example</span>
    </div>
    <div class="vt-teacher-try"><strong>Try this:</strong> explain [concept] back to me in your own words — I'll tell you what you missed.</div>
    <p class="vt-teacher-community">Practice with others: <a href="#">community link</a></p>
  </div>
</div>
```

## Code block (`.vt-code`) — filename header + copy button + optional Prism highlighting

```html
<div class="vt-code">
  <div class="vt-code-head"><span>filename.py</span><button class="vt-code-copy">Copy</button></div>
  <pre><code class="language-python">def hello():
    return "world"</code></pre>
</div>
```

Add the Prism vendor scripts **before** `visual-teach.js`. The copy button and
Prism init are both wired automatically by `visual-teach.js`. Without Prism (or
JS disabled) the block stays readable — it degrades to styled plain text.

Vendor scripts (in `assets/prism/`): `prism-core`, `prism-clike`, `prism-javascript`,
`prism-python`, `prism-sql`, `prism-bash`.

```html
<script src="../assets/prism/prism-core.min.js"></script>
<script src="../assets/prism/prism-clike.min.js"></script>
<script src="../assets/prism/prism-javascript.min.js"></script>
<script src="../assets/prism/prism-python.min.js"></script>
<script src="../assets/prism/prism-sql.min.js"></script>
<script src="../assets/prism/prism-bash.min.js"></script>
<script src="../assets/visual-teach.js"></script>
```

## Inline token emphasis (`.vt-pcode`) — spotlight one keyword

```html
<p>The <code class="vt-pcode">return</code> keyword exits a function.</p>
```

No JS required. Renders with accent background + border so it stands out from
plain `<code>` without being syntax-highlighted.

## Footer / sources (numbered refs, source-type icons, companion slot, verified-date)
Source types for `data-type`: `spec` `doc` `video` `forum` `book`
```html
<footer class="vt-sources">
  <span class="lbl">Sources</span>
  <ol class="vt-reflist">
    <li><span class="vt-src-ic" data-type="spec"></span><a href="#">Official tutorial</a> <span class="note">— one-line note.</span></li>
    <li><span class="vt-src-ic" data-type="doc"></span><a href="#">Reference docs</a></li>
    <li><span class="vt-src-ic" data-type="video"></span><a href="#">Quick-start (video)</a></li>
    <li><span class="vt-src-ic" data-type="forum"></span><a href="#">Community forum</a></li>
  </ol>
  <div class="vt-companion"><span class="vt-src-ic" data-type="book"></span>Companion reference: <a href="#">Glossary &amp; concept map</a></div>
  <div class="meta">Lesson 0001 · verified 2026-06-19</div>
</footer>
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

## Computed graphs — opt-in mermaid (sequence / state / ER only)

**Default to the CSS diagram vocabulary** (`.vt-diagram`, `.vt-node`, `.vt-flow`,
`.vt-row`, `.vt-col`, `.vt-split`) for anything you can compose by hand — it
prints cleanly, works offline, and carries zero JS overhead.

Use mermaid **only** when the graph must be auto-laid-out: sequence diagrams,
state machines, ER diagrams.

```html
<!-- 1. Add the bridge script (after visual-teach.js, or just before </body>) -->
<script src="../assets/mermaid.js"></script>

<!-- 2. Write your diagram inside .vt-mermaid — mermaid CDN loads only if this
     element is found on the page. -->
<div class="vt-mermaid">
sequenceDiagram
  Client->>Server: Request
  Server-->>Client: Response
</div>
```

The bridge reads the 9 `--vt-*` tokens at render time and maps them to
mermaid's `themeVariables`, so diagrams match the lesson palette and switch
automatically with dark mode.

## Theming — override any of the 9 tokens in the lesson `<head>`:
```html
<style>:root{ --vt-accent:#0d7d4d; --vt-ink:#11181c; }</style>
```
Tokens: `--vt-ink --vt-muted --vt-accent --vt-accent-fg --vt-rule --vt-paper
--vt-good --vt-bad --vt-warn`. Topic-specific colors (e.g. a product's own UI
palette) belong here, not in `visual-teach.css`.
