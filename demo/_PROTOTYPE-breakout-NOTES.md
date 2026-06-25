# PROTOTYPE verdict — vt-wide policy + geometry

**Question:** centered vs left-anchored breakout? pure opt-in vs always-on vs hybrid?
**Artifact:** `_PROTOTYPE-breakout.html` (delete both after folding decision in).

## Geometry — DECIDED: left-anchored `grid-column: 2 / -1`

Over-applied/small `.vt-wide` blocks stay glued to the prose left edge and only
extend right into the gutter. Centered (`1 / -1`) floats small blocks in the
middle with twin gutters → breaks spatial contiguity. Left-anchored makes
over-application degrade gracefully. Cost: big media hangs right instead of
centering — no pedagogy evidence favors centering, so accepted.

## Policy — DECIDED: runtime auto-detect (supersedes opt-in + triggers)

A ~15-line `wireBreakout()` in `base.js` (runs in existing `init()` on
DOMContentLoaded; classic script, works file://, no server): for each
`main > .vt-table-wrap / .vt-code / .vt-diagram`, measure natural (max-content)
width via an off-screen clone vs the block's column width at rest; toggle
`.vt-wide` iff it genuinely overflows. Verified in prototype (`?policy=auto`).

Why this beat pure opt-in:

- Measurement > heuristics: an 8-col table of short values stays at measure
  (it fits) — the static "≥6 cols" rule would have mis-widened it.
- No author decision, no triggers doc, no forgotten-`.vt-wide` case (both
  failure modes of the static policies vanish — nothing is left to a blind agent).
- Graceful no-JS fallback: nothing widens → tables/code scroll, diagrams shrink
  (today's behavior). Safe.
- Makes the #9 fix surgical: `min-width:0` + `svg{max-width:none}` apply ONLY to
  `.vt-diagram.vt-wide`, so a wide diagram scrolls within the frame while non-wide
  diagrams keep `max-width:100%` shrink — the mobile tradeoff disappears. The
  full-page #9 fix (handoff item 9) is NOT needed.
  Cost accepted: layout shift on load (only the wide minority jump; small blocks
  never move); width decided at runtime, not visible in source.

### (superseded) earlier lean: pure opt-in + documented triggers

Key empirical finding from the prototype:

- **Content-sizing (`width:max-content`) already neutralizes always-on for tables
  and code.** Applying `.vt-wide` to a small table/code block does nothing — it
  only widens if its content actually needs the room. So opt-in vs always-on is a
  no-op for these two types.
- **Diagrams (`width:100%`) are the sole always-on casualty.** Under always-on a
  3-node flow balloons to the full frame; a vertical stacked flow maroons a 240px
  column inside a frame-wide grey box; back-to-back trivial diagrams both break
  out so "wide = important" loses all signal. (Real SVG/mermaid would instead
  _shrink_ to fit — the opposite failure, equally unwanted.)
- Therefore **hybrid as originally scoped (diagrams default-on, e.g. `.vt-mermaid`)
  is the WORST option** — it auto-widens the exact type that misbehaves. Rejected.

Pure opt-in dodges all of it: nothing widens by accident, the author marks only
genuinely-wide blocks via structural triggers (table >5–6 cols / long unbreakable
cells; diagram 4+ horizontal lanes; code with unwrappable long lines; never
prose/callout/quiz/checklist).

## Opt-in's one real-but-mild wound: forgotten `.vt-wide` on a wide block

- table / code → self-rescue via `overflow-x:auto` (scroll). Fine.
- diagram → does NOT self-rescue. `svg{max-width:100%}` (bug #9) shrinks it to the
  measure instead of scrolling. Legible for simple diagrams, mush for dense ones.
  No page blowout (safe), just shrunk.

## #9 fix is NOT one line (prototype-verified) — defer it

To make a forgotten wide diagram _scroll_ instead of shrink needs THREE rules together:

1. `.vt-diagram svg { max-width: none }` (the change; was 100%)
2. `.vt-diagram { min-width: 0 }` (NEW + subtle: it's a grid item; default
   min-width:auto = SVG's 1200px intrinsic → blows the column out. Tables/code escape
   this because their min-content can shrink; a fixed SVG's cannot.)
3. `.vt-diagram { overflow-x: auto }` (already present, line 10)
   Half-fix (max-width:none alone) is WORSE than the bug — overflows the whole page.
   Also flips mobile diagrams from shrink-to-fit → scroll. Real work + tradeoff →
   keep deferred; today's shrink behavior is safe and self-contained.
