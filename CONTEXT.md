# Context — visual-teach

Glossary for the project. Terms only — no implementation details, no decisions
(those live in `docs/`).

## Glossary

**visual-teach** — A passive component library _and_ an **add-on skill** for
`/teach`. The library is one stylesheet (`visual-teach.css`) + one script
(`visual-teach.js`) that supply look and interactive behavior to lessons via
conventional CSS classes (compare: Bootstrap, not a renderer). **Compose-only:**
operates in **Compose** mode only — auto-invoked mid-`/teach` as the model picks
up the asset files from `./assets/`. It has **no standalone authoring** — authoring
is always `/teach`'s job; invoked to author from scratch with no `/teach`
installed, it points the user to install `/teach` and stops. It does _not_ own a
lesson format, a schema, or a validator, and it deliberately does _not_
reimplement `/teach`'s pedagogy.

**Compose (mode)** — visual-teach active in the agent's context _during_ a
`/teach` authoring run, so the lesson is born using `vt-*` blocks + shared assets.
Triggered by model auto-invocation; empirically reliable (5/5, ADR 0002). The
only mode visual-teach operates in — there is no explicit Convert verb.

**/teach** — The third-party teaching skill this is an add-on to:
`mattpocock/skills`, `skills/productivity/teach`. Owns lesson authoring, the
teaching workspace, mission, zone-of-proximal-development, citations, and
multi-session learning state. visual-teach hard-depends on it for authoring;
the two compose in the agent's context (the agent reads both skills), never by
editing `/teach`'s files.

**Lesson** — A single self-contained HTML file that teaches one tightly-scoped
thing. Authored and owned by the `/teach` skill, not by visual-teach. Opened
directly from `file://`. (Term inherited from `/teach`.)

**Workspace** — A directory holding one topic's teaching artifacts (lessons,
references, assets, learning records). visual-teach's two files live in the
workspace's `./assets/`. (Term inherited from `/teach`.)

**Block** — A recurring visual/interactive unit inside a lesson (quiz, callout,
checklist, annotated-code, …). In visual-teach a block is _only_ a documented
**convention**: a CSS class + optional `data-*` attributes that the stylesheet
styles and the script may enhance. It is not an enforced type — unknown or
malformed markup renders inert, it is never "invalid."

**Author** — The agent (`/teach`, or a modified `/teach`) that writes lesson HTML.
The author reaches for visual-teach conventions when it wants a block's look and
behavior; nothing requires it to.

**Convention** (not "contract") — A documented class + attribute shape for a
block. Followed for the styling/behavior payoff, not enforced. Deliberately not
called a "contract" or "schema": visual-teach validates nothing.

**teach-base** — The frozen, pristine A/B control baseline. A copy of `/teach`
with only `disable-model-invocation` removed so it can be invoked as a subagent.
Contains no `visual-teach` awareness, no `vt-*` knowledge, and seeds no assets.
Lessons it produces are plain hand-written HTML — the control arm for comparing
against the visual-teach add-on. **Do not edit:** modifying it silently invalidates
any A/B comparison that uses it as the baseline. See `docs/ab-comparison-methodology.md`.

**treatment twin** — The A/B treatment arm. An invocable copy of the owned `teach`
skill derived on-demand by `scripts/derive-treatment.sh`: `teach` with only
`disable-model-invocation` stripped, byte-identical to `teach` in every other
respect. Because it is generated, not hand-authored, it cannot drift from `teach`.
Paired with `teach-base` for side-by-side comparisons — the delta between the two
arms measures the value the component library adds. See `docs/ab-comparison-methodology.md`.
