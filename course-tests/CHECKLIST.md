# Course-test checklist

Use this checklist when evaluating output from a `teach-course` probe run.

## Methodology guard (read before logging any finding)

A probe is a smoke test of the `teach-test` skill, not a gap-hunt of the component
library. **A probe may only exercise `vt-*` blocks that the skill itself emits.**

Before logging a "missing component" finding, verify:

- [ ] The skill _actually generated content_ that needed a `vt-*` block (e.g. code
      output → needs `vt-code`; a quiz → needs `vt-quiz`).
- [ ] You did **not** hand-roll placeholder content (a fake `<img>` path, a
      fabricated class, HTML the skill would never write) to make the gap appear.
- [ ] The gap is demand-driven: if the only way to surface it is to hard-code
      content yourself, there is **no gap — there is no demand.**
- [ ] For visual crafts (photography, etc.): if the skill cannot acquire source
      media, the expected output is a _built_ visual (CSS, SVG, mermaid, `vt-flow`),
      not a photo placeholder. A hand-rolled `<figure>` that renders empty is fabricated
      demand, not a discovered gap.

Findings that fail this check must be annotated as **manufactured** or **retracted**
in `FINDINGS.md` and must not drive new component development. See #87 for the
methodology fix and #86 for the example of a component built on a fabricated gap.

## Run checklist

- [ ] Probe subject chosen is teachable without external media the skill cannot produce.
- [ ] All `vt-*` blocks in the output come from the skill, not from hand-edited HTML.
- [ ] Each finding names the specific skill-generated content that lacked a block.
- [ ] No `<img>` or `<figure>` elements were manually inserted into probe output.
- [ ] Findings logged in `FINDINGS.md` with block-type, lesson, and evidence quote.
