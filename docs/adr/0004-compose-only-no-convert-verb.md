# visual-teach is Compose-only; the Convert verb is removed

Status: accepted

## Context

visual-teach originally documented two operating modes:

- **Compose** — auto-invoked mid-`/teach` as the model picks up `./assets/`.
- **Convert** — an explicit `/visual-teach [file|all]` verb that retrofitted
  existing lessons to `vt-*` blocks and served as the cold-start seed + bulk
  migrator.

ADR 0002 established empirically (5/5 fresh workspaces) that the model
spontaneously seeds `./assets/` and authors with `vt-*` blocks without any
explicit invocation. The PRD §104 progressive-disclosure restructure confirmed
that the authoring reference (lean index + on-demand block files) already
removes the only remaining reason to keep a Convert section in `SKILL.md`.

## Decision

Remove the Convert verb entirely. visual-teach is **Compose-only**.

Cold-start seeding rides on Compose auto-seeding, backed by the 5/5 evidence
in ADR 0002. The filesystem channel (`/teach` reads `./assets/` by its own
charter) means once the files exist — however they got there — every future
lesson in the workspace benefits automatically.

No bulk-migration or retrofit verb is needed: there is no programmatic path to
drive `/teach` anyway (ADR 0002), and the filesystem channel makes a single-pass
seed sufficient. Keeping a Convert verb alongside Compose would present two
entry points for one outcome and invite confusion about which to reach for.

## Consequences

- `CONTEXT.md`: the **Convert (mode)** glossary entry is removed; the
  visual-teach entry is updated to "Compose-only."
- `docs/PRD.md` §9: rewritten from "Invocation: the Convert verb" to
  "Invocation: Compose-only."
- `SKILL.md`: the Convert section was already removed (issue #106 /
  progressive-disclosure restructure).
- `tests/skill.mjs`: three Convert tests were removed in issue #106; new
  tests assert that `CONTEXT.md` and `PRD.md` carry no Convert framing.
- The progressive-disclosure reference structure (lean index +
  `assets/blocks/*.md` on-demand) remains the canonical authoring reference;
  this ADR records the verb-removal half of PRD #104.
