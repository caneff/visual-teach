# visual-teach — authoring index

These two assets (`visual-teach.css`, `visual-teach.js`) style and animate a
lesson. **Link them in every lesson and use the `vt-*` classes instead of
inlining your own CSS/JS.** Colors come from 9 themeable tokens — override them
in the lesson `<head>` to match the topic; never hardcode hex.

Link in `<head>` / before `</body>` (relative to `lessons/`):

```html
<link rel="stylesheet" href="../assets/visual-teach.css" />
<!-- ... -->
<script src="../assets/visual-teach.js"></script>
```

> **Do NOT add `type="module"` to the `<script>` tag above.** `visual-teach.js` is
> a plain UMD/IIFE script, not an ES module. Adding `type="module"` causes browsers
> to load it under CORS rules — which blocks file:// delivery with a CORS policy
> error, silently disabling all interactive components (quizzes, checklists, theme
> toggle, copy buttons). The primary delivery mode is file://, so this footgun kills
> the whole page with no visible error unless you inspect the console.

## These blocks are a floor, not a ceiling

The `vt-*` blocks cover the commodity parts of a lesson so you don't reinvent
them and lessons share a consistent look. They are **not** a ceiling, and
**not a mold every lesson must fit**. When a topic needs an interaction the
catalog can't express, build it as a new component in `./assets/` and let it
sit alongside the `vt-*` blocks. Reach for bespoke when it genuinely serves
the topic; the point is to avoid same-y, templated lessons.

## Page shell

**Starting a new lesson? Copy this `<main>` block and the asset link/script
snippet above as your structural skeleton — the consistent HTML frame only,
not a complete lesson with fixed slots to fill.** The body between
`vt-mission` and `vt-recap` is composed from the block menu below; there
are no mandatory pedagogical blocks. Delete any shell element you don't need.

```html
<main>
  <p class="vt-kicker">Topic · Lesson 1</p>
  <h1>Lesson title</h1>
  <p class="vt-lede">One-sentence promise of the lesson.</p>

  <!-- Meta bar: time / prereqs / difficulty / lesson position -->
  <div class="vt-metabar">
    <span class="item">⏱ <strong>~15 min</strong></span>
    <span class="item">Needs: <strong>Lesson 1 complete</strong></span>
    <span class="item"
      ><span class="vt-level intermediate">Intermediate</span></span
    >
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
  <div class="vt-mission">
    <strong>Why this matters for your goal:</strong> …
  </div>

  <!-- Section heading. JS auto-adds id (slug of text) + hover "#" anchor — just write the h2. -->
  <h2><span class="vt-num">1</span>Section heading</h2>
  …prose: plain p / ul / code / a, auto-themed…

  <!-- Primary-source card -->
  <div class="vt-source">
    <div>
      <span class="h">Primary source</span> <a href="…">Source title</a> — one
      sentence on why this source.
    </div>
  </div>

  <!-- Recap + up-next teaser -->
  <div class="vt-recap">
    <p class="h">✦ What you earned</p>
    One sentence on what the learner can now do.
  </div>
  <p class="vt-upnext"><em>Up next:</em> next topic.</p>
</main>
```

## Block menu — open only what this lesson needs

**Open only the block files this lesson needs.** Loading all of them at once
is what produces stamped, same-chrome-every-lesson output. Decide what a
specific lesson requires from the menu below; open only those block files.
Most lessons use 2–4 blocks, not all seven.

| Block               | Reach for when…                                                                                   | File                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Callouts            | you need a tip, warning, insight, success, or risk box — or a difficulty label                    | [blocks/callouts.md](blocks/callouts.md)                   |
| Code + IO           | you're showing code snippets, shell output, or input/output pairs                                 | [blocks/code-io.md](blocks/code-io.md)                     |
| Tables, pills, keys | you're comparing options, listing key-value pairs, labeling status, or showing keyboard shortcuts | [blocks/tables-pills-keys.md](blocks/tables-pills-keys.md) |
| Quizzes + checklist | you need a knowledge check or a step-by-step procedure                                            | [blocks/quizzes-checklist.md](blocks/quizzes-checklist.md) |
| Diagrams            | you're visualizing structure, flow, comparisons, or abstract concepts                             | [blocks/diagrams.md](blocks/diagrams.md)                   |
| Math                | the lesson involves equations, formulas, or symbolic notation                                     | [blocks/math.md](blocks/math.md)                           |
| Teacher box         | you want to invite the learner to ask a question (discretionary — write fresh each time)          | [blocks/teacher-box.md](blocks/teacher-box.md)             |

## Recap + up-next teaser

A forward _teaser_ — plain prose, **not** a link/button (the next lesson isn't
written yet, so a "Next" link would be dead). Just name what's coming.

```html
<div class="vt-recap">
  <p class="h">✦ What you earned</p>
  One-sentence summary of what the learner can now do.
</div>
<p class="vt-upnext"><em>Up next:</em> topic name.</p>
```

## Footer / sources — `vt-sources` (source-type icons, companion slot, verified-date)

Source types for `data-type`: `spec` `doc` `video` `forum` `book`

```html
<footer class="vt-sources">
  <span class="lbl">Sources</span>
  <ul class="vt-reflist">
    <li>
      <span class="vt-src-ic" data-type="spec"></span
      ><a href="#">Official tutorial</a>
      <span class="note">— one-line note.</span>
    </li>
    <li>
      <span class="vt-src-ic" data-type="doc"></span
      ><a href="#">Reference docs</a>
    </li>
    <li>
      <span class="vt-src-ic" data-type="video"></span
      ><a href="#">Quick-start (video)</a>
    </li>
    <li>
      <span class="vt-src-ic" data-type="forum"></span
      ><a href="#">Community forum</a>
    </li>
  </ul>
  <div class="vt-companion">
    <span class="vt-src-ic" data-type="book"></span>Companion reference:
    <a href="#">Glossary &amp; concept map</a>
  </div>
  <div class="meta">Lesson 0001 · verified 2026-06-19</div>
</footer>
```

## Theming — override any of the 9 tokens in the lesson `<head>`:

```html
<style>
  :root {
    --vt-accent: #4338ca;
    --vt-accent-fg: #fff;
  }
</style>
```

A flat `:root` override is safe for **all 9 tokens** in both light and dark mode.
vt's forced-dark rule uses `:root[data-theme="dark"]` (specificity 0,2,0), which beats
a flat `:root` (0,1,0) — so vt's dark accent wins automatically and dark-mode contrast
stays correct without any per-theme blocks in your stylesheet.

Theme-varying tokens (vt re-sets these in dark mode): `--vt-ink --vt-muted --vt-accent
--vt-accent-fg --vt-rule --vt-paper --vt-good --vt-bad --vt-warn`.

Derived tokens (`--vt-soft --vt-stripe --vt-neutral-soft --vt-accent-dk --vt-accent-soft`)
update automatically from the base tokens and need not be overridden.

Topic-specific colors (e.g. a product's own UI palette) belong here, not in
`visual-teach.css`.
