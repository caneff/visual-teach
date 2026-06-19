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

## Theming — override any of the 9 tokens in the lesson `<head>`:
```html
<style>:root{ --vt-accent:#0d7d4d; --vt-ink:#11181c; }</style>
```
Tokens: `--vt-ink --vt-muted --vt-accent --vt-accent-fg --vt-rule --vt-paper
--vt-good --vt-bad --vt-warn`. Topic-specific colors (e.g. a product's own UI
palette) belong here, not in `visual-teach.css`.
