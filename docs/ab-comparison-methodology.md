# A/B Comparison Methodology: Does the `visual-teach` skill improve agent-authored lessons?

This document records how we ran a controlled A/B test of the `visual-teach`
skill, so the experiment can be repeated and so the reasoning behind issues
[#28](https://github.com/caneff/visual-teach/issues/28) and
[#29](https://github.com/caneff/visual-teach/issues/29) is traceable.

## Goal

Measure whether the `visual-teach` skill actually produces better lessons than
a baseline agent that has only the generic `teach-base` skill — with the skill
as the **only** variable. Everything else (topic, plan, quizzes, environment)
is held constant so any difference in output is attributable to the skill, not
to luck or a different prompt.

## Experimental design

Three threats to a fair comparison were identified and neutralized before any
lesson was built.

1. **Same plan to both arms.** A single shared spec was written to
   `/tmp/teach-compare/SPEC.md` with a pre-filled mission and an identical
   3-lesson plan: same learning objectives, same code examples, same diagram
   content, and the **same two quizzes per lesson**. Both arms receive this
   exact spec. Only the _medium_ may differ (plain hand-written HTML vs.
   `vt-*` blocks). This guarantees we compare the skill, not the content.

2. **True skill isolation, not just instructions.** Telling the baseline agent
   "don't use visual-teach" is not enough — it could still read the skill
   source. The root cause: `~/.claude/skills/visual-teach` was a **symlink**
   into the dev repo, exposing the entire repository as the registered skill.
   The symlink was **deleted** so `visual-teach` is no longer a registered
   skill and cannot appear in any subagent's skill list. Both arms also build
   in a **clean room outside the repo** (`/tmp/teach-compare/`) so the baseline
   agent cannot `cat` the skill source from its working directory.

3. **Subagents can't interview the user.** The `teach-base` skill normally
   interviews the user, which would stall a headless subagent. The mission was
   pre-filled in the spec so neither agent blocks.

### Subject choice

CSS Flexbox. Chosen deliberately: it is _naturally visual_ (main axis, cross
axis, alignment) yet _fully teachable in plain text_. Any gap between the two
builds is therefore real signal, not an artifact of a topic that secretly
requires pictures.

## Execution

Two subagents run **in parallel** (safe once there is no shared filesystem
state), each given the identical spec:

- **no-visual arm** → `/tmp/teach-compare/no-visual/`
  Has only `teach-base`. `visual-teach` is unregistered and absent from cwd.
  Forced to hand-write its own CSS/JS.
- **with-visual arm** → `/tmp/teach-compare/with-visual/`
  Given `teach-base` plus an explicit **path** pointer to the repo
  (`/home/caneff/src/visual-teach/SKILL.md` + `assets/`), since the registry
  entry was removed.

### Verify the control

```bash
grep -ril visual-teach /tmp/teach-compare/no-visual/   # must return nothing
```

A nonempty result means isolation leaked and the run is invalid.

## Analysis

**Quantitative diff.** Lesson line counts (456 no-visual vs. 565 with-visual,
+24%), styling approach (hand-written `course.css` + `quiz.js` vs. shared
`visual-teach.css/js` + Prism), and block inventory (invented plain HTML vs.
~25 `vt-*` blocks).

**Qualitative deep diff.** Both Lesson 2 files were read in full, plus the
shared CSS. Findings:

- The with-visual build's central diagram (the six `justify-content` values)
  is **broken**: the agent reused `vt-flow`, a _sequence_ component that
  injects `margin-left` + `→` arrows between children, distorting the spacing
  demo. The no-visual build used real `display:flex` containers and rendered
  correctly. → issue #28.
- The with-visual build ships six Prism JS files but **no CSS grammar**, so CSS
  code blocks render un-highlighted. → issue #29.
- The skill raised the floor on easy-to-skimp things (per-option quiz
  feedback, `aria-live`/a11y, objectives/recap structure, localStorage
  persistence, theming) but raised adoption risk when the agent applied an
  unfamiliar component to the wrong job.

## Outcome

Two GitHub issues were filed with file:line evidence (#28, #29). The skill was
left uninstalled per the user's decision. These are the issues now being routed
through sandcastle.

## Files produced

- `/tmp/teach-compare/SPEC.md` — the shared identical plan
- `/tmp/teach-compare/no-visual/lessons/000{1,2,3}*.html` (+ hand-written
  `course.css`, `quiz.js`, reference doc)
- `/tmp/teach-compare/with-visual/lessons/000{1,2,3}*.html` (+ copied
  `visual-teach.css/js` assets)

Note: built under `/tmp`, so these are not committed to the repo.

## Reusable principles

- **Isolate the variable structurally, not by instruction.** Delete the
  symlink / build in a clean room rather than asking the agent to behave.
- **Same plan, both arms.** Pre-write one spec; vary only the thing under test.
- **Verify the control** with a `grep` before trusting the result.
- **Pick a subject where the medium is optional**, so a difference is signal.

---

## Related: the in-repo before/after demo (cron lesson)

A separate, earlier comparison lives in the repo: `demo/cron-0001-before.html`,
`demo/cron-0001-after.html`, and `demo/cron-0001-compare.html` (the last
iframes both panes side-by-side with a theme toggle). The `after` is generated
by running the `/visual-teach` skill on the `before` file.

Its key principle, worth keeping: **when the `after` looks worse, fix the
`visual-teach` library — do not edit the `after` directly.** The `after` is a
byproduct of the library, not an artifact to hand-tune. This drove real library
fixes (e.g. adding `.vt-row.nowrap` to `assets/visual-teach.css`). The
`.sandcastle/shot.mjs` screenshot script exists to catch layout regressions from this
flow without manual eyeballing.
