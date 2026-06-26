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

| Subject                            | Adopted? | Notes                                                                                         |
| ---------------------------------- | -------- | --------------------------------------------------------------------------------------------- |
| git rebase vs merge                | ✅       | full component library, unprompted                                                            |
| TLS handshake                      | ✅       |                                                                                               |
| regular expressions                | ✅       | adopted, but used `vt-quiz` (recognition) where the control built a bespoke live regex tester |
| Bayes' theorem                     | ✅       | used `vt-math`/`vt-quiz`/`vt-checklist`; no bespoke frequency calculator                      |
| CSS flexbox                        | ❌       | built bespoke                                                                                 |
| music: intervals & the major scale | ❌       | never reached for the skill; built a bespoke keyboard, interval trainer, and scale builder    |

Side-by-side demos (control vs treatment, per lesson):
[`demo/adoption-demos/index.html`](../demo/adoption-demos/index.html).

Auto-fire is model-strength dependent — a sonnet probe on the first subject did
_not_ fire; opus did. The floor above is the opus floor.

## Open finding: adoption ≠ strictly-better output

Adoption raises the **consistency and polish floor** but can lower the
**bespoke-interactivity ceiling**. Three subjects show the tension directly:

- **regex** — the treatment adopted `visual-teach` but reached for the nearest
  block, a multiple-choice `vt-quiz` (recognition), while the control, with no
  catalog to anchor it, built a live regex tester (typed input → `new RegExp` →
  live match). The catalog pulled the treatment toward the nearest block and
  away from the richer free-input interaction the "write a regex" win wanted.
- **Bayes** — adopted, and used the math/KaTeX component as hoped, but the
  produce-win (compute a posterior) became a `vt-quiz`/`vt-checklist`, not the
  bespoke frequency-grid calculator the lesson would ideally offer.
- **music** — the treatment never fired the skill at all and went fully bespoke
  (clickable keyboard, interval trainer, scale builder). For a heavily visual,
  produce-heavy subject the catalog was not even consulted — and the bespoke
  result is genuinely good. This is a _correct_ non-adoption.

The mitigation in flight is a strengthened "floor, not a ceiling" nudge that
reframes the trigger from _can a block express this?_ to _what practices the
win?_ — routing produce/manipulate wins toward a bespoke live exercise instead
of settling for the nearest block. The gaps this floor exposes are tracked as
follow-ups: lowering the skill's perceived activation cost (#208), a generic
free-input component (`vt-sandbox`) to cover the type-and-see-a-result
interaction (#209), a cheaper fire/no-fire measurement mode (#210), and a
description A/B to push the floor up without sacrificing the ceiling (#211).

**Takeaway:** treat the floor as a quality _floor_, not a target to maximize
blindly. The win is consistent, polished lessons by default; the guardrail is
keeping bespoke interaction available — and chosen — where the topic needs it.
