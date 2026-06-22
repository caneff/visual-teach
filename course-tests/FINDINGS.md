# Course-test findings

Findings from `teach-course` probe runs. Entries that fail the methodology guard in
`CHECKLIST.md` are annotated **[RETRACTED — manufactured gap]**.

---

## sourdough probe (pre-#87)

Subject: sourdough bread.

### [RETRACTED — manufactured gap] Image / photo component

**Status:** Retracted. This finding was manufactured, not discovered. See #86, #87.

The probe hand-rolled a `<figure>` element with a placeholder `<img>` path that the
`teach-test` skill never generates. The probe then logged "🔴 no figure component"
because nothing rendered the hand-authored markup. That is fabricated demand: the
skill has no path to acquire or embed photographs, so there was never any real
content the library failed to display.

Acting on this finding produced `vt-figure` and `vt-figure-pair` (issues #72, #79),
which were later removed (#86) because the blocks rendered empty 100% of the time —
exactly as expected when the underlying demand does not exist.

**Rule violated:** A probe may only exercise blocks the skill actually emits. If the
only way to surface a gap is to hand-author content, there is no gap (see #87 and
`CHECKLIST.md` methodology guard).

**Corrective action:** `vt-figure` / `vt-figure-pair` removed (#86). Probe
methodology guard added to `teach-course` SKILL.md and this checklist (#87).
