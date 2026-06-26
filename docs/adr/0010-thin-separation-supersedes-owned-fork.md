# visual-teach is a thin separation from /teach; the owned fork is retired

Status: accepted

## Context

ADR 0006 established that visual-teach **owns a fork of `/teach`** as
`.claude/skills/teach/`. The fork bundled the full component collection and
injected an explicit per-component seeding protocol into the skill. The rationale
was that a first-class authoring skill needed the pedagogy baked in.

In practice, maintaining the fork created ongoing synchronisation cost:
`sync-teach-assets.sh` had to be run after every component change, `derive-treatment.sh`
had to be used to produce an invocable treatment twin for A/B work, and the fork
could silently drift from upstream. The fork also bundled duplicate copies of
every component asset, bloating the skill directory.

The seeding protocol is the actual value visual-teach adds — the table mapping
each component to its files, the worked `cp` examples, the per-component
discipline that keeps no-math courses free of KaTeX. This protocol lives cleanly
in the **visual-teach `SKILL.md`** itself, without requiring visual-teach to also
own the pedagogy.

## Decision

Retire the owned fork (thin separation supersedes the fork model):

- **Delete `.claude/skills/teach/`** — the fork, its bundled assets copy, and
  its `*-FORMAT.md` files. The upstream `/teach` (`mattpocock/skills`) is the
  authoritative pedagogy source; this repo does not maintain a copy.
- **Move the per-component seeding protocol into root `SKILL.md`** (the
  `visual-teach` source). Paths reference `<this skill's base dir>/assets/...`.
  This is the one job visual-teach owns: getting the right files into `./assets/`
  before `/teach` authors lessons.
- **`teach-base` stays** — it is the frozen A/B control and referenced by
  `teach-course`. It is unchanged by this decision.
- **Add `upstream-patch/teach-pointer.patch`** — the one optional pointer line
  that upstream `/teach` can apply to proactively invoke visual-teach. Applying
  this patch is not required; visual-teach can always be invoked manually first.
  _Superseded (#180/#211): auto-fire adoption is high without the pointer
  (12/12 on a clean control), so the patch and its `ab-harness.sh` pointer arm
  were removed and the upstream-PR follow-on (#179) closed as obsolete._
- **Delete `scripts/sync-teach-assets.sh`** and **`scripts/derive-treatment.sh`**
  — both existed only to serve the fork. Without the fork, neither is needed.
- **A/B treatment arm** is now upstream `/teach` + `visual-teach` (invoked in
  sequence) versus `teach-base` alone. No script needed to derive the treatment
  arm; the two skills are installed and composed directly.

## Consequences

- ADR 0006 is superseded (kept for history; the owned-fork model no longer
  applies).
- `tests/teach-skill.test.mjs` and `tests/ab-treatment.test.mjs` are deleted —
  both tested properties of the now-deleted fork. `tests/skill.mjs` passes
  unchanged, now covering the root visual-teach `SKILL.md` which carries the
  seeding protocol.
- `README.md`, `CONTEXT.md`, `CODING_STANDARDS.md`, and
  `docs/ab-comparison-methodology.md` updated to remove fork/script references.
- The seeding protocol in root `SKILL.md` is now the single source of truth for
  how components reach a `/teach` workspace.
