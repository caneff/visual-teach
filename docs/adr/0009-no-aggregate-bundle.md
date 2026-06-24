# No aggregate bundle — Base + Components is the delivery

Status: accepted

## Context

The library historically shipped, alongside the per-Component files, two
hand-maintained aggregates: `assets/visual-teach.js` and
`assets/visual-teach.css` — each a single file containing the whole library.
This was the original "one stylesheet + one script" delivery (ADR 0001) and was
offered to lessons as "Option A — monolithic bundle" in the Catalog.

After ADR 0006 moved the project to the component-collection model (each
Component self-contained and copyable; the owned `/teach` skill seeds
per-Component), the aggregates became a parallel, hand-kept _source_ rather than
a derivative:

- The same behaviour existed three times — the helper layer
  (`announce`/`ensure`/`verdict`) in `visual-teach.js`, again in `base.js`, and
  a third time renamed (`_ensure`, …) inside each Component; every wirer
  (`wireQuiz`, …) existed in both the monolith and its Component. Nothing
  generated one from the other, so they drifted (e.g. `code.js`'s warning had
  lost its block-class prefix — invisible because no test ran the shipped file).
- The four consumers disagreed on which fork was canonical: README and the
  Catalog told lessons to load the monolith; the tests imported the monolith;
  but `scripts/showcase.js` and `scripts/sync-teach-assets.sh` used (and shipped)
  the per-Component files, with `sync` _deleting_ the monolith from the bundle.
  So the seeded Catalog's Option A pointed at a file the bundle didn't contain.

Generating the monolith from the Components (like `showcase.html`) was
considered. It was rejected: nothing in the product loads it (the skill seeds
per-Component), and the file:// + no-ES-modules constraint already requires each
Component to be standalone, so an aggregate earns no leverage — only a build step
and a second thing to keep honest.

## Decision

The library is **a Base spine (`base/base.css` + `base/base.js`) plus a
collection of copyable Components**. There is **no aggregate bundle**. Lessons
link Base and only the Components they use; each Component ships its own CSS,
optional plain UMD/IIFE script, and `demo.html`, and is self-contained so it can
be copied on its own.

`assets/visual-teach.js` and `assets/visual-teach.css` are deleted. Tests import
the Component and Base files that actually ship. `base.js` carries only the spine
(theme bridge/toggle, anchors, `init`); its vestigial `announce`/`ensure`/
`verdict` exports are removed. The repetition of a small `_ensure` across
Components is deliberate — the price of standalone copyability under file:// —
not drift to be eliminated.

## Consequences

- ADR 0001's "copy into each workspace, don't share a global install" decision
  stands; only its naming of `visual-teach.js`/`.css` as the copied unit is
  superseded — the copied unit is now Base + the needed Components.
- ADR 0006's component-collection migration is complete: the parallel aggregate
  source it left behind is gone.
- The "one stylesheet + one script" identity in README, CONTEXT.md, SKILL.md,
  and docs/PRD.md is restated as "Base + Components".
- A future architecture review proposing to (re)introduce a convenience bundle —
  hand-written or generated — should read this ADR first: the aggregate's only
  consumers were tests and one harness, and the no-modules/standalone-copy
  constraints make it net cost, not leverage.
