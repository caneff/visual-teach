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

## Theming — override any of the 9 tokens in the lesson `<head>`:
```html
<style>:root{ --vt-accent:#0d7d4d; --vt-ink:#11181c; }</style>
```
Tokens: `--vt-ink --vt-muted --vt-accent --vt-accent-fg --vt-rule --vt-paper
--vt-good --vt-bad --vt-warn`. Topic-specific colors (e.g. a product's own UI
palette) belong here, not in `visual-teach.css`.
