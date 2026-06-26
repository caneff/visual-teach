# Context — visual-teach

Glossary for the project. Terms only — no implementation details, no decisions
(those live in `docs/`).

## Glossary

**visual-teach** — A component library for teaching lessons: a Base spine
(`base.css` + `base.js`) plus a collection of copyable Components that supply
look and interactive behavior to lessons via conventional CSS classes (compare:
Bootstrap, not a renderer). There is no aggregate bundle — a lesson links Base
and only the Components it uses; each Component is self-contained so it can be
copied on its own. visual-teach does _not_ own a lesson format, a schema, or a
validator, and it does _not_ reimplement `/teach`'s pedagogy. It is invoked before
`/teach` to seed per-component assets into the workspace.

**/teach** — The upstream `mattpocock/skills` teaching skill
(`skills/productivity/teach`). Owns lesson authoring, the teaching workspace,
mission, zone-of-proximal-development, citations, and multi-session learning
state. When visual-teach is installed, invoke it first so that assets are seeded
before `/teach` authors lessons. Upstream `/teach` discovers and reuses whatever
is in `./assets/` by its own charter.

**teach-base** — The frozen, pristine A/B control baseline. A copy of the
upstream `/teach` with only `disable-model-invocation` removed so it can be
invoked as a subagent. Contains no `visual-teach` awareness, no `vt-*` knowledge,
and seeds no assets. Lessons it produces are plain hand-written HTML — the
control arm for quality A/B comparisons. **Do not edit:** modifying it silently
invalidates any comparison that uses it as the baseline. See
`docs/ab-comparison-methodology.md`.

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

**adoption** — The treatment author firing visual-teach on its own and using **at
least one `vt-*` block in the lesson markup** (not merely seeding assets into
`./assets/`). Adoption is **orthogonal** to whether the lesson also builds a
**bespoke** exercise for its produce-win: visual-teach is a _floor_ (commodity
look and behavior), and bespoke interaction stacks on top, never instead. Target
is **100%** on every subject. Going fully bespoke without using a `vt-*` block is
**non-adoption — a defect**, not a "correct" abstention; the floor was thrown away
and styling reinvented. Measured by a `vt-*` class in `lessons/*.html`, not by
`vt-` anywhere in the workspace.

**candidate** (or **arm**) — One `description` wording under test in the auto-fire
bake-off. Candidates are **peers**: there is no privileged "control," and the
currently-shipped wording is just one more candidate. Each lives as a full
`SKILL.md` under `scripts/adoption-candidates/` and is swapped into the treatment
arm by the harness `CANDIDATE` env var. The winning candidate is applied to the
repo `SKILL.md`.

**Convention** (not "contract") — A documented class + attribute shape for a
component. Followed for the styling/behavior payoff, not enforced. Deliberately
not called a "contract" or "schema": visual-teach validates nothing.
