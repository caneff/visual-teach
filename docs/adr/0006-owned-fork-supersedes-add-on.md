# visual-teach owns a fork of /teach; the add-on stance is retired

Status: superseded by ADR 0010

## Context

ADR 0002 established that visual-teach is an _add-on_ to an unmodified,
third-party `/teach` skill. The constraint was real: `/teach` sets
`disable-model-invocation: true`, blocking every programmatic invocation path.
The workaround was a filesystem channel — planting asset files in `./assets/` so
`/teach` would pick them up by its own reuse rule ("read `./assets/` and build from
the components already there").

Issue #111 changed the situation: visual-teach now **owns a fork of `/teach`**
as `.claude/skills/teach/`. The owned fork bundles the full component collection
under `assets/` and injects an explicit per-component seeding protocol directly
into the skill. There is no longer a third-party boundary to work around.

## Decision

Retire the add-on/compose stance and the filesystem-channel framing. The project
is now described as:

- **One owned `teach` skill** — a fork of the upstream `/teach` pedagogy, bundling
  the component library and seeding rules. The single authoritative authoring skill.
- **`teach-base`** — the frozen upstream `/teach` (minus the invocation flag), kept
  as the immutable A/B control baseline. Never edited.
- **Derived treatment twin** — `teach` with `disable-model-invocation` stripped,
  generated on-demand by `scripts/derive-treatment.sh` for quality A/B comparisons.
- **Component collection** — the CSS/JS/demo units under `assets/components/`, each
  copyable and self-contained. The **Catalog** (`assets/visual-teach.md`) is the
  thin index; each **Component** is a named cluster (css + optional js + demo.html).

## Consequences

- ADR 0002 is superseded (kept for history; the "add-on not fork" constraint no
  longer applies).
- ADR 0004 (Compose-only) is also superseded as a framing artifact: the owned fork
  makes seeding explicit in the skill itself, so the "filesystem channel" and
  "Compose auto-seed" concepts are retired. The skill seeds on its first action.
- `probe-adoption.sh` is deleted: adoption measurement is moot once reuse is
  explicit (the owned skill seeds the assets directly; there is nothing to measure).
- README, CONTEXT.md, SKILL.md, and docs/PRD.md drop add-on / filesystem-channel /
  Compose-mode framing and describe the owned-fork, component-collection model.
- `docs/ab-comparison-methodology.md` keeps the quality-comparison harness
  (teach vs teach-base) and drops the adoption-isolation apparatus (symlink delete,
  clean-room) that existed only to guard against the add-on leaking.
