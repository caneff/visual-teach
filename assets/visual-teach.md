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
Wrong clicks show feedback and a "Try again" button without locking the quiz.

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

## Teacher box / sources footer
```html
<div class="vt-teacher"><strong>🎓 Stuck?</strong> Ask your teacher (the agent) …</div>
<footer class="vt-sources">Sources: <a href="…">…</a> · Lesson 0001</footer>
```

## Theming — override any of the 9 tokens in the lesson `<head>`:
```html
<style>:root{ --vt-accent:#0d7d4d; --vt-ink:#11181c; }</style>
```
Tokens: `--vt-ink --vt-muted --vt-accent --vt-accent-fg --vt-rule --vt-paper
--vt-good --vt-bad --vt-warn`. Topic-specific colors (e.g. a product's own UI
palette) belong here, not in `visual-teach.css`.
