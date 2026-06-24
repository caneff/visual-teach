# A/B Comparison Methodology: Does the `visual-teach` skill improve agent-authored lessons?

This document records how we run controlled A/B tests of the `visual-teach`
skill, so experiments can be repeated and the results are traceable.

## Harness design — the two arms

Every side-by-side comparison uses the same two arms:

| Arm           | Skill                   | What it knows                                                                                                                                                                  |
| ------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Control**   | `teach-base`            | Pristine upstream `/teach` pedagogy, no `vt-*` awareness, no asset seeding. Invocable as a subagent. **Never edit** — any modification silently invalidates prior comparisons. |
| **Treatment** | derived twin of `teach` | Full pedagogy **+** bundled component library (all `vt-*` blocks, seeding rules). Invocable as a subagent. Generated on-demand; never hand-authored.                           |

The diff between the two arms on an **identical spec** is the measured value of
the component library — pedagogy and content are held constant, only the visual
layer varies.

### Deriving the treatment twin

The treatment arm is **generated, never authored**, so it cannot drift from `teach`.
It is literally `teach` with `disable-model-invocation` stripped:

```sh
scripts/derive-treatment.sh [target-dir]
# default target: /tmp/teach-treatment
```

The script (`scripts/derive-treatment.sh`) copies `.claude/skills/teach` to the
target directory and removes the `disable-model-invocation` line from `SKILL.md`.
The result is byte-identical to `teach` except that one line. To run manually:

```sh
cp -r .claude/skills/teach /tmp/teach-treatment
sed -i '/^disable-model-invocation:/d' /tmp/teach-treatment/SKILL.md
```

Register the twin as a skill before invoking it:

```sh
mkdir -p ~/.claude/skills
ln -sfn /tmp/teach-treatment ~/.claude/skills/teach-treatment
```

### Running a side-by-side comparison

Write one shared spec (`/tmp/teach-compare/SPEC.md`): same mission, same
3-lesson plan, same quizzes. Run two subagents in parallel, each given the
identical spec:

- **Control subagent** → `/tmp/teach-compare/control/`  
  Has only `teach-base`. No `vt-*` asset files in `./assets/`.
- **Treatment subagent** → `/tmp/teach-compare/treatment/`  
  Has the derived twin (registered as `teach-treatment`). Pre-seed `./assets/`
  from the bundled component collection so the agent discovers it under its own
  reuse rule.

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
