# Context — visual-teach

Glossary for the project. Terms only — no implementation details, no decisions
(those live in `docs/`).

## Glossary

**visual-teach** — A passive component library *and* an **add-on skill** for
`/teach`. The library is one stylesheet (`visual-teach.css`) + one script
(`visual-teach.js`) that supply look and interactive behavior to lessons via
conventional CSS classes (compare: Bootstrap, not a renderer). It runs in two
modes: **Compose** (auto, mid-`/teach`) and **Convert** (explicit). It has **no
standalone authoring** — authoring is always `/teach`'s job; invoked to author
from scratch with no `/teach` installed, it points the user to install `/teach`
and stops. It does *not* own a lesson format, a schema, or a validator, and it
deliberately does *not* reimplement `/teach`'s pedagogy.

**Compose (mode)** — visual-teach active in the agent's context *during* a
`/teach` authoring run, so the lesson is born using `vt-*` blocks + shared assets.
Triggered by model auto-invocation; not guaranteed (see ADR 0002).

**Convert (mode)** — visual-teach's *only* explicit verb. `/visual-teach
[file|all]` retrofits an **existing** lesson's HTML to `vt-*` blocks + shared
assets: ensure assets exist, strip inline `<style>`/`<script>`, swap classes,
link assets. A mechanical edit (no script), driven by SKILL.md instructions.
Needs no `/teach` (it transforms, it does not author). Doubles as the bulk
migration tool for adopting visual-teach across old lessons.

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
checklist, annotated-code, …). In visual-teach a block is *only* a documented
**convention**: a CSS class + optional `data-*` attributes that the stylesheet
styles and the script may enhance. It is not an enforced type — unknown or
malformed markup renders inert, it is never "invalid."

**Author** — The agent (`/teach`, or a modified `/teach`) that writes lesson HTML.
The author reaches for visual-teach conventions when it wants a block's look and
behavior; nothing requires it to.

**Convention** (not "contract") — A documented class + attribute shape for a
block. Followed for the styling/behavior payoff, not enforced. Deliberately not
called a "contract" or "schema": visual-teach validates nothing.
