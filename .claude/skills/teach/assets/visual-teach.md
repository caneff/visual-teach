# visual-teach — component catalog

`visual-teach` ships as a **base + 9 standalone components**. Each component is
self-contained: its CSS file, optional JS, and a co-located `demo.html` that is
both the usage doc and the rendering proof. See `demo/showcase.html` for all
components on one page.

**These blocks are a floor, not a ceiling.** `vt-*` covers the commodity parts.
When a topic needs an interaction the catalog can't express, build a bespoke
component in `./assets/` and place it alongside the `vt-*` blocks.

## Linking — base + pick your components

Link the Base spine, then add only the CSS and JS for the components this lesson
uses. There is no aggregate bundle: each component is self-contained so it can be
copied on its own.

```html
<link rel="stylesheet" href="../assets/base/base.css" />
<link rel="stylesheet" href="../assets/components/callout/callout.css" />
<!-- add only the component CSS files this lesson needs -->
<script src="../assets/base/base.js"></script>
<!-- add interactive component scripts as needed, e.g.: -->
<script src="../assets/components/quiz/quiz.js"></script>
```

> **Do NOT add `type="module"` to these `<script>` tags.** `base.js` and the
> component scripts are plain UMD/IIFE scripts, not ES modules. Adding
> `type="module"` causes browsers to load them under CORS rules — which blocks
> file:// delivery with a CORS policy error, silently disabling all interactive
> components (quizzes, checklists, theme toggle, copy buttons). The primary
> delivery mode is file://, so this footgun kills the whole page with no visible
> error unless you inspect the console.

## Page shell

Copy this `<main>` skeleton when starting a new lesson. It is the structural
frame only — not a complete lesson with fixed slots to fill.

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

  <!-- h2 sections: JS auto-adds id (slug of text) + hover "#" anchor -->
  <h2><span class="vt-num">1</span>Section heading</h2>
  …prose: plain p / ul / code / a, auto-themed…

  <!-- Primary-source card -->
  <div class="vt-source">
    <div>
      <span class="h">Primary source</span> <a href="…">Source title</a> — one
      sentence.
    </div>
  </div>

  <!-- Recap + up-next teaser -->
  <div class="vt-recap">
    <p class="h">✦ What you earned</p>
    One-sentence summary.
  </div>
  <p class="vt-upnext"><em>Up next:</em> next topic.</p>
</main>
```

## Component catalog

Open only the component demos this lesson needs — loading all of them at once
produces stamped, same-chrome-every-lesson output. Most lessons use 2–4
components, not all nine.

| Component   | Reach for when…                                                                                        | Demo                                                                 |
| ----------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| callout     | you need a tip, warning, insight, success, or risk box                                                 | [components/callout/demo.html](components/callout/demo.html)         |
| code        | showing code snippets, shell output, or input→output pairs                                             | [components/code/demo.html](components/code/demo.html)               |
| table       | comparing options, listing key-value pairs, or status grids                                            | [components/table/demo.html](components/table/demo.html)             |
| chip        | labeling status, difficulty, steps, or keyboard shortcuts (.vt-pill / .vt-badge / .vt-kbd / .vt-level) | [components/chip/demo.html](components/chip/demo.html)               |
| quiz        | a knowledge check (single or multi-select, retry-until-correct)                                        | [components/quiz/demo.html](components/quiz/demo.html)               |
| checklist   | a step-by-step procedure with persisted progress                                                       | [components/checklist/demo.html](components/checklist/demo.html)     |
| diagram     | visualizing structure, flow, comparisons, or abstract concepts                                         | [components/diagram/demo.html](components/diagram/demo.html)         |
| math        | equations, formulas, or symbolic notation (KaTeX)                                                      | [components/math/demo.html](components/math/demo.html)               |
| teacher-box | inviting the learner to ask a question (write fresh each time — never reuse template)                  | [components/teacher-box/demo.html](components/teacher-box/demo.html) |

## Quiz authoring rules

Keep option text to roughly equal visible length. Use uniform inline `<code>` so
options stay scannable. Don't spell out punctuation: write `git merge` not
"run 'git merge'".

## Footer / sources

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
vt's forced-dark rule uses `:root[data-theme="dark"]` (specificity 0,2,0), which
beats a flat `:root` (0,1,0) — so vt's dark accent wins automatically and
dark-mode contrast stays correct without any per-theme blocks in your stylesheet.

Theme-varying tokens (vt re-sets these in dark mode): `--vt-ink --vt-muted --vt-accent --vt-accent-fg --vt-rule --vt-paper --vt-good --vt-bad --vt-warn`.

Derived tokens (`--vt-soft --vt-stripe --vt-neutral-soft --vt-accent-dk
--vt-accent-soft`) update automatically from the base tokens and need not be
overridden.
