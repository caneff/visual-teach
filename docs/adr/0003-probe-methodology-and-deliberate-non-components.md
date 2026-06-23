# Course-test probes only exercise skill-generated content; the library deliberately omits some components

Status: accepted

The `teach-course` probe is a smoke test of the `teach-base` skill, not a
gap-hunt of the component library. It generates a throwaway course on some
subject and checks that real lesson content maps onto `vt-*` blocks. The courses
themselves are disposable scratch — regenerate one when you need to probe; do not
keep them in the repo.

## Methodology guard

A probe may only exercise `vt-*` blocks the skill **actually emits** for real,
generatable content. Never hand-roll placeholder content (a fake `<img>` path, a
fabricated class, HTML the skill would never write) and then log the absence of a
component to render it as a "missing component." If the only way to surface a gap
is to author the content yourself, there is no gap — there is no demand.

For visual crafts where the skill cannot acquire source media (photos, audio,
video, maps), the expected output is a **built** visual — CSS, inline SVG,
mermaid, `vt-flow` — not a media placeholder.

## The bar for a real finding

A finding is real only if one holds:

1. **Wrong/broken output** — an emitted block renders incorrectly under a real
   condition (RTL, print, forced-colors, narrow viewport, no-JS).
2. **Verbatim recurrence** — the same markup is copy-pasted across courses, so a
   component would dedupe genuine duplication.

Explicitly **not** a finding: "laborious to author by hand" (that is agent token
cost, not a learner-facing or correctness failure), interactivity that would be
merely nicer to have, or content the skill cannot generate in the first place.

## Probe against canonical assets, not the per-course bundle

ADR 0001 copies the assets into each workspace, so a course's bundled
`visual-teach.css` is a snapshot that drifts from the canonical `./assets/` as the
library is fixed. A probe that loads the **bundled** CSS tests stale code and
yields false positives (a narrow-viewport probe "found" a `vt-split` overflow that
was already fixed in canonical). Point probes at the root `./assets/`.

## Deliberate non-components

Considered and rejected — the library intentionally does not ship these, because
existing primitives already express the generatable content:

- **Image / figure** — the skill cannot acquire photographs; built visuals are the
  answer. `vt-figure`/`vt-figure-pair` were built (issues #72, #79) on a
  hand-rolled placeholder (a methodology-guard violation) and removed (#86) after
  rendering empty 100% of the time.
- **XY plot / chart** — inline SVG is the native primitive for arbitrary drawing,
  and plotted curves are not verbatim-recurring (a growth curve, a stacked area,
  and a bell curve are three different shapes). Reached for across two independent
  quantitative probes (compound interest, the normal distribution) and rejected
  both times; the SVG path expressed the content correctly each time. The only
  from-scratch risk worth naming is a plot that renders cleanly while
  misrepresenting the math — a verification concern, fixed by a narrow data→path
  helper if it ever bites, not a charting component.
- **Numeric / free-text quiz input** — a multiple-choice `vt-quiz` whose
  distractors are themselves computed values encoding specific misconceptions
  fully serves "compute it, then confront the wrong mental model" pedagogy. A
  free-text input would add autograding nicety, not pedagogical content.
- **Vendored / baked mermaid** — `vt-mermaid` loads mermaid as a classic
  `<script src=CDN>`, which renders from a double-clicked `file://` page with no
  local server **when online**. Offline-only is the sole gap, and closing it
  (bake-to-SVG or a vendored bundle) risks reintroducing the module-CORS
  needs-a-server footgun that the `type="module"` ban exists to avoid. Not worth
  it (issue #103 closed not-planned).

## The flip side: robustness findings are real

When an emitted block renders wrong under a real condition, that is a genuine bug
and has driven shipped fixes: `vt-flow`/`th` under RTL (#97, #98), callout tones
and quiz state under forced-colors (#101), and the `@media print` hardening
(#100). Robustness/a11y axes — not new components — are where the remaining value
is.
