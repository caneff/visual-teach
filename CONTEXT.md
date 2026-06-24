# Context — visual-teach

Glossary for the project. Terms only — no implementation details, no decisions
(those live in `docs/`).

## Glossary

**visual-teach** — A component library for teaching lessons: one stylesheet
(`visual-teach.css`) + one script (`visual-teach.js`) that supply look and
interactive behavior to lessons via conventional CSS classes (compare: Bootstrap,
not a renderer). The owned `/teach` skill (`teach`) bundles the component
library and seeds it into a workspace on its first run. visual-teach does _not_
own a lesson format, a schema, or a validator, and it does _not_ reimplement
`/teach`'s pedagogy.

**/teach** — The owned fork of the upstream `mattpocock/skills` teaching skill,
living at `.claude/skills/teach/`. Owns lesson authoring, the teaching workspace,
mission, zone-of-proximal-development, citations, and multi-session learning
state. Bundles the component library under `assets/` and seeds it into the
workspace on its first run via an explicit per-component seeding protocol.

**teach-base** — The frozen, pristine A/B control baseline. A copy of the
upstream `/teach` with only `disable-model-invocation` removed so it can be
invoked as a subagent. Contains no `visual-teach` awareness, no `vt-*` knowledge,
and seeds no assets. Lessons it produces are plain hand-written HTML — the
control arm for quality A/B comparisons. **Do not edit:** modifying it silently
invalidates any comparison that uses it as the baseline. See
`docs/ab-comparison-methodology.md`.

**treatment twin** — The A/B treatment arm. An invocable copy of the owned `teach`
skill derived on-demand by `scripts/derive-treatment.sh`: `teach` with only
`disable-model-invocation` stripped, byte-identical to `teach` in every other
respect. Because it is generated, not hand-authored, it cannot drift from `teach`.
Paired with `teach-base` for side-by-side comparisons — the delta between the two
arms measures the value the component library adds. See `docs/ab-comparison-methodology.md`.

**Component** — A self-contained, copyable CSS/JS unit in the component
collection. Each component lives under `assets/components/<name>/` and ships a
`<name>.css` (required), an optional `<name>.js` (for interactive behavior), and
a `demo.html` that both documents and renders the component — the
**demo-as-doc** principle. A component is not an enforced type: unknown or
malformed markup renders inert, never "invalid."

**Base** — The always-linked spine every lesson must include:
`assets/base/base.css` (the 9 `--vt-*` tokens, reset, and prose rules) and
`assets/base/base.js` (the wiring for interactive blocks). Lesson 1 of any
workspace copies these in first; every subsequent component adds on top.

**Catalog** — The thin index at `assets/visual-teach.md`. Lists every component
cluster with a "reach for when…" trigger, links to each component's `demo.html`,
and carries selective-load guidance. The agent reads the Catalog first, then opens
only the component files the lesson needs.

**chip** — The inline-marker component (`assets/components/chip/`). Ships
`.vt-pill` (a status/topic badge), `.vt-badge` (a count/step badge), `.vt-kbd`
(keyboard keycap), and `.vt-level` (difficulty pill). Known in the PRD as "pill"
or "chip" interchangeably; `chip` is the canonical component directory name.

**demo-as-doc** — The convention that each component's `demo.html` serves as
both the rendered proof and the authoritative usage reference. No separate
prose doc is needed; the demo's markup _is_ the documentation. A component is
not considered complete without a `demo.html`.

**Lesson** — A single self-contained HTML file that teaches one tightly-scoped
thing. Authored and owned by the `/teach` skill. Opened directly from `file://`.
(Term inherited from `/teach`.)

**Workspace** — A directory holding one topic's teaching artifacts (lessons,
references, assets, learning records). The component library lives in the
workspace's `./assets/`. (Term inherited from `/teach`.)

**Author** — The agent (`/teach`) that writes lesson HTML. The author reaches for
visual-teach components when it wants a block's look and behavior; nothing requires
it to.

**Convention** (not "contract") — A documented class + attribute shape for a
component. Followed for the styling/behavior payoff, not enforced. Deliberately
not called a "contract" or "schema": visual-teach validates nothing.
