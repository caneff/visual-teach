# Shared spec — git rebase vs merge

Identical for both arms (control = teach-base only; treatment = teach-base +
visual-teach available). Pins the mission and a fixed 3-lesson plan. Each arm
authors freely _within_ this plan; wording may diverge, the topic series is
fixed. This spec must never mention the visual layer.

## Mission

A working developer integrates feature branches every day but cannot confidently
choose between `git merge` and `git rebase`. They fear rebase ("it rewrites
history and I'll lose work"), so they merge everything and end up with a tangled
history full of noise commits — or they rebase blindly and clobber a teammate's
work. The goal: understand exactly what each command does to commit history, and
choose the right one for a given situation without anxiety.

Auto-generated mission; the learner can edit it.

## Fixed lesson plan (exactly 3 lessons, in order)

1. **The two shapes of history** — the smallest true mental model. What `merge`
   does (creates a merge commit; preserves the real, branching graph) vs what
   `rebase` does (replays your commits onto a new base; produces a linear graph,
   new commit hashes). Build the commit-graph intuition; no decision-making yet.

2. **Choosing between them** — the decision skill. Given a concrete scenario
   (e.g. "tidy up my local feature branch before opening a PR", "integrate main
   into a long-running shared branch", "update my branch with the latest main"),
   decide merge vs rebase and justify it. Centered on a recall/decision feedback
   loop the learner works through.

3. **Rebase without fear** — applied practice toward the mission. The golden
   rule (never rebase commits that have been pushed and shared), how to recover
   (`git reflog`), and resolving conflicts mid-rebase (`--continue` / `--abort`).
   Interleaves lessons 1 and 2 in a short applied checklist/workflow.

## Constraints

- Beginner who uses git daily but only knows `add`/`commit`/`push`/`pull` and
  basic `merge`. No prior rebase experience. Assume command-line git.
- One tangible win per lesson; keep each short.
