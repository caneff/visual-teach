# visual-teach adoption floor

**What this measures:** how reliably `/teach` reaches for `visual-teach` on its
own when the skill is merely _available_ — never named in the prompt, never
pre-seeded. This is the auto-fire adoption floor: the rate at which an
unprompted authoring run discovers and invokes the component library.

**Date:** 2026-06-25 · **Model:** opus (the model real users run)

## Method

Each (arm × subject) cell runs as a fresh, isolated headless `claude -p`
subagent via `scripts/adoption-harness.sh`. Isolation is by custom `$HOME`:

- **control** — `teach-base` pedagogy only; `visual-teach` is _not discoverable_.
- **treatment** — `teach-base` + the current-repo `visual-teach` available but
  not pre-seeded. The arm "adopts" only if it finds and invokes the skill itself.

The authoring prompt is identical for both arms and never mentions the visual
layer. Each subject pins a fixed lesson plan in a shared `SPEC.md` so the arms
differ only in whether `visual-teach` was reachable. A hard gate validates every
control: `grep -ril 'vt-'` over the control workspace must be empty, or the
subject is discarded.

## Result: 4 of 6 adopted on opus

| Subject                            | Adopted? | Notes                                                                                                                                                                                                          |
| ---------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| git rebase vs merge                | ✅       | full component library, unprompted                                                                                                                                                                             |
| TLS handshake                      | ✅       |                                                                                                                                                                                                                |
| regular expressions                | ✅       | adopted, but used `vt-quiz` (recognition) where the control built a bespoke live regex tester                                                                                                                  |
| Bayes' theorem                     | ✅       | used `vt-math`/`vt-quiz`/`vt-checklist`; no bespoke frequency calculator                                                                                                                                       |
| CSS flexbox                        | ❌       | built bespoke — a **miss** under the orthogonal-adoption model (below)                                                                                                                                         |
| music: intervals & the major scale | ❌       | never reached for the skill; built a bespoke keyboard, interval trainer, and scale builder — **reclassified a miss** (below): should have linked Base + a `vt-*` block for the commodity parts, bespoke on top |

Side-by-side demos (control vs treatment, per lesson):
[`demo/adoption-demos/index.html`](../demo/adoption-demos/index.html).

Auto-fire is model-strength dependent — a sonnet probe on the first subject did
_not_ fire; opus did. The floor above is the opus floor.

**Corrected target — 6/6.** Adoption (firing the skill and using at least one
`vt-*` block in a lesson) is _orthogonal_ to whether the lesson also builds a
bespoke exercise: `visual-teach` is a floor that stacks under custom work, never
a substitute for it. So both ❌ rows are genuine misses, not correct abstentions,
and the target on this subject set is 6/6 — see the corrected finding below.

## Open finding: adoption ≠ strictly-better output

Adoption raises the **consistency and polish floor**; the risk is reaching for
the _nearest block_ and stopping there, leaving the **bespoke-interactivity
ceiling** on the table. Adoption and bespoke are orthogonal — firing the skill
never precludes building a custom exercise on top. Three subjects show the
tension directly:

- **regex** — the treatment adopted `visual-teach` but reached for the nearest
  block, a multiple-choice `vt-quiz` (recognition), while the control, with no
  catalog to anchor it, built a live regex tester (typed input → `new RegExp` →
  live match). The catalog pulled the treatment toward the nearest block and
  away from the richer free-input interaction the "write a regex" win wanted.
- **Bayes** — adopted, and used the math/KaTeX component as hoped, but the
  produce-win (compute a posterior) became a `vt-quiz`/`vt-checklist`, not the
  bespoke frequency-grid calculator the lesson would ideally offer.
- **music** — the treatment never fired the skill at all and went fully bespoke
  (clickable keyboard, interval trainer, scale builder). The bespoke result is
  genuinely good, but going fully bespoke _threw away the floor_: no shared Base,
  no consistent theming or prose, every commodity part reinvented. The lesson
  should have linked Base and used `vt-*` for the commodity parts with its bespoke
  widgets on top. This is a **miss**, not a correct non-adoption — adoption and
  bespoke were never mutually exclusive.

The mitigation in flight is a strengthened "floor, not a ceiling" nudge that
reframes the trigger from _can a block express this?_ to _what practices the
win?_ — routing produce/manipulate wins toward a bespoke live exercise instead
of settling for the nearest block. The gaps this floor exposes are tracked as
follow-ups: lowering the skill's perceived activation cost (#208), a generic
free-input component (`vt-sandbox`) to cover the type-and-see-a-result
interaction (#209), a cheaper fire/no-fire measurement mode (#210), and a
description A/B to push the floor up without sacrificing the ceiling (#211).

**Takeaway:** adoption _is_ the floor and the target is 100% — every lesson
should link Base and use at least one `vt-*` block, because the floor (consistent
theming, prose, commodity blocks) is always worth having. The guardrail is not
suppressing adoption but keeping bespoke interaction _chosen and stacked on top_
where the topic's produce-win needs it. Maximize adoption; protect the ceiling
separately.

## A/B: description bake-off (#211)

A bake-off over candidate `description` blobs — the only text the model sees
before firing (`description` and `when_to_use` are concatenated into one
≤1,536-char skill listing, so each candidate folds `when_to_use` into a single
`description`). Goal: push auto-fire toward the 6/6 target without regressing the
bespoke ceiling.

**Arms — a 2×2 factorial** (`scripts/adoption-candidates/`), crossing two factors
of the wording, everything else held identical so each contrast is single-variable:

|                     | minimal (no composes clause) | + composes clause     |
| ------------------- | ---------------------------- | --------------------- |
| **floor lead**      | `floor-minimal`              | `floor-composes`      |
| **imperative lead** | `imperative-minimal`         | `imperative-composes` |

- **lead** — "`visual-teach` is the styling + behavior _floor_ under every lesson"
  vs the imperative "On every teaching lesson, link the Base first".
- **composes clause** — whether the blob spells out "use the blocks for the
  commodity parts and build your bespoke exercise on top, never instead of it"
  (the hypothesised antidote to the build-heavy misses) or stops at "applies …
  including custom or interactive ones".

The design reads both main effects and their interaction. These are _peer_
candidates — there is no privileged control; the currently-shipped wording is not
an arm.

**Method:** `CANDIDATE=<arm> ./scripts/adoption-harness.sh build-homes`, then
`run-until-signal` each of the 6 subjects, N=5 per cell (4 arms × 6 × 5 = 120
runs; escalate mid-range cells to N=10). The fire signal is a `vt-*` block in
`lessons/*.html` — seeding assets alone does not count. Winner = highest mean fire
rate on a clear margin; ties
break to the shorter blob.

**Scope:** this measures _fire rate only_. The ceiling guard — confirming the
winner still builds bespoke where the produce-win needs it — is a deferred
follow-up full-authoring run, not yet done.

**Results:** _pending first pilot run._
