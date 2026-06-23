---
name: teach-base
description: Pristine A/B control baseline — the upstream /teach pedagogy with zero visual-teach awareness. Pure plain-HTML lesson authoring. Do not edit; touching this skill invalidates every A/B comparison that uses it as the control arm.
---

# teach-base — frozen A/B control

**Do not edit this skill.** It is the pristine, un-forked baseline for A/B
comparisons against the `visual-teach` add-on. Any modification silently
invalidates every side-by-side comparison that uses it as the control arm.
See `docs/ab-comparison-methodology.md` for the full experiment design.

## What it is

`teach-base` is `/teach` (`mattpocock/skills`, `skills/productivity/teach`)
with one change: `disable-model-invocation: true` is removed so the skill
can be invoked programmatically as a subagent. Every pedagogy rule,
lesson format, workspace convention, and authoring instruction is otherwise
the upstream unmodified `/teach`.

## What it deliberately omits

- No `visual-teach` instructions
- No `vt-*` class knowledge
- No bundled assets (does not populate `./assets/`)
- No component library references of any kind

A lesson authored by `teach-base` produces plain, hand-written HTML with
no `vt-*` classes and no shared component files. That output is the
**control arm** — what teaching looks like without the visual-teach add-on.

## Use

Invoke as the control arm of an A/B comparison with `visual-teach`:

- **Control arm:** `teach-base` alone — authors plain HTML, hand-writes CSS/JS.
- **Experiment arm:** `teach-base` plus the `visual-teach` skill — authors
  with `vt-*` blocks and shared asset files.

Hold everything else constant (topic, plan, quiz content) so any difference
in output is attributable to the skill, not to content variation.

**Do not add visual-teach or `vt-*` instructions here.** The isolation must
be structural (skill contents), not instructional ("don't use it"). Telling
a baseline agent to avoid a skill it can still read is not true isolation.
