# A/B Comparison Methodology: Does the `visual-teach` skill improve agent-authored lessons?

This document records how we run controlled A/B tests of the `visual-teach`
skill, so experiments can be repeated and the results are traceable.

## Harness design — control vs treatment

The control arm is the frozen `teach-base` pedagogy with **zero** visual-teach;
the treatment arm adds visual-teach. A stable baseline that can be re-run months
later and compared apples-to-apples against prior results.

| Arm           | Skill / setup                      | What it knows                                                                                                                                                                  |
| ------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Control**   | `teach-base`                       | Pristine upstream `/teach` pedagogy, no `vt-*` awareness, no asset seeding. Invocable as a subagent. **Never edit** — any modification silently invalidates prior comparisons. |
| **Treatment** | upstream `/teach` + `visual-teach` | Full pedagogy **+** visual-teach seeded assets (all `vt-*` components available). Invocable as a subagent; visual-teach is invoked first to seed the workspace assets.         |

`teach-base` is the frozen snapshot used here; it intentionally does not drift.
The runnable harness is `scripts/adoption-harness.sh` (control vs treatment,
`$HOME`-isolated) — see `docs/adoption-floor.md`.

---

The diff between the two arms on an **identical spec** is the measured value of
the component library — pedagogy and content are held constant, only the visual
layer varies.

### Setting up the treatment arm

Install upstream `/teach` from `mattpocock/skills` and install `visual-teach`.
Before each session, invoke `visual-teach` to seed `./assets/` with the required
components — then invoke `/teach` to author lessons. The treatment subagent
discovers and reuses whatever is in `./assets/` under `/teach`'s own reuse rule.

### Running a side-by-side comparison

Write one shared spec (`/tmp/teach-compare/SPEC.md`): same mission, same
3-lesson plan, same quizzes. Run two subagents in parallel, each given the
identical spec:

- **Control subagent** → `/tmp/teach-compare/control/`  
  Has only `teach-base`. No `vt-*` asset files in `./assets/`.
- **Treatment subagent** → `/tmp/teach-compare/treatment/`  
  Has upstream `/teach` + `visual-teach`. visual-teach seeds `./assets/` first;
  `/teach` authors lessons using those components.

After both complete, diff the lesson HTML to isolate what the component library
contributed. Verify the control with:

```sh
grep -ril 'vt-' /tmp/teach-compare/control/   # must return nothing
```

A non-empty result means isolation leaked — the run is invalid.

## Goal

Measure whether the `visual-teach` skill actually produces better lessons than
a baseline agent that has only the generic `teach-base` skill — with the skill
as the **only** variable. Everything else (topic, plan, quizzes, environment)
is held constant so any difference in output is attributable to the skill, not
to luck or a different prompt.

## Reusable principles

- **Same spec, both arms.** Pre-write one spec; vary only the thing under test.
- **Verify the control** with a `grep` before trusting the result.
- **Pick a subject where the medium is optional**, so a difference is signal.
- **When the after looks worse, fix the library** — do not edit lesson output
  directly. The output is a byproduct of the library, not an artifact to hand-tune.
