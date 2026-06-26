# Shared spec — Bayes' theorem

Identical for both arms (control = teach-base only; treatment = teach-base +
visual-teach available). Pins the mission and a fixed 3-lesson plan. Each arm
authors freely _within_ this plan; wording may diverge, the topic series is
fixed. This spec must never mention the visual layer.

## Mission

A numerate person — comfortable with basic probability, fractions, and a little
algebra — keeps getting conditional probability wrong. They conflate "the chance
of a positive test given the disease" with "the chance of the disease given a
positive test," and they're shocked that a positive result on an accurate test
can still mean you probably don't have the disease. The goal: understand Bayes'
theorem well enough to update a belief with evidence correctly, and to see
through the base-rate fallacy on a real screening problem without being fooled.

Auto-generated mission; the learner can edit it.

## Fixed lesson plan (exactly 3 lessons, in order)

1. **Conditional probability and the trap** — the smallest true mental model.
   What `P(A | B)` means (the probability of A _restricted to_ the cases where B
   holds), and why it is **not** symmetric: `P(A | B) ≠ P(B | A)` in general.
   Build the intuition with counts over a population (conditioning = zooming into
   a sub-group), and name the famous confusion. No theorem or formula yet.

2. **Bayes' theorem** — the core skill. The formula
   `P(H | E) = P(E | H) · P(H) / P(E)` and what each part is called: prior,
   likelihood, evidence, posterior. Derive it in one step from the definition of
   conditional probability so it isn't a magic incantation. Centered on a
   recall/decision feedback loop: given a worded scenario, identify the prior and
   likelihood and compute the posterior.

3. **The base-rate fallacy, applied** — applied practice toward the mission. The
   classic medical-screening paradox: a rare condition plus an imperfect test
   yields a low posterior even after a positive result. Work it with **natural
   frequencies** (out of 10,000 people…) to make it concrete, then interleave
   lessons 1–2 into a short applied checklist for any "positive test, should I
   worry?" scenario.

## Constraints

- Comfortable with basic probability (probabilities as fractions/percentages,
  simple events, independence) and light algebra. No prior exposure to Bayesian
  updating or the theorem.
- Lead with natural frequencies (counts out of a population) before the algebra;
  use the formula to confirm the count-based answer, not replace it.
- Render real mathematical notation for the formula and worked steps.
- One tangible win per lesson; keep each short.
