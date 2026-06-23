# Context — Sandcastle orchestrator

Glossary for the `.sandcastle/` dev-automation orchestrator that builds issues
into PRs. Terms only — no implementation details, no decisions (those live in
`docs/adr/`). Distinct from the repo-root `CONTEXT.md`, which is visual-teach's.

## Glossary

**Run** — One invocation of the orchestrator (`main.mts`). Loops plan→execute
over iterations until the buildable backlog drains or the iteration cap is hit.
Produces a set of PRs.

**Iteration** — One plan→execute cycle inside a run. The planner selects the
issues unblocked *right now*; later iterations pick up issues whose blockers
completed in earlier iterations of the same run.

**Issue branch** — `sandcastle/issue-<id>`. Holds one issue's commits, cut from
its resolved base (its parent's branch, or `main`).

**Parent** — An issue another issue builds on, emitted by the planner as
`parents: string[]`. At build time a parent is always either completed *this
run* (its issue branch exists) or already in `main` (earlier run, merged).
_Avoid_: blocker (a blocker is unbuilt; a parent is built and depended on).

**Chain** — A linear sequence of issues linked parent→child off a single root
(e.g. `112 → 108`).

**Root** — A parentless issue; its base is `main`. The start of a chain.

**Forest** — The whole run's set of issue branches, structured as independent
chains off `main` rather than one linear stack. Replaces the former single
integration tip.
_Avoid_: integration tip, run branch, stack (the old single-tip model).

**Component** — A connected piece of the run's dependency forest (issues linked
by parent edges, transitively). The **atomic floor** of PR grouping: because a
child branch physically contains its parent's commits, a component can never be
split across PRs — only combined with others. May fork (one parent, several
children) or join (diamond).

**Topic group** — A set of issues the planner tags with the same `group` key
because they belong to the same feature/theme, even when no dependency links
them. The grouping signal for PRs. Topic combines independent components; it can
never split a component (parent edges win).

**PR set** — One connected component of the graph whose edges are
`{parent edges} ∪ {same-group-key edges}`, over the issues completed this run.
Becomes exactly one PR. Its **head** is the merge of its leaf tips (issues no
other issue in the set builds on): a single tip is the head directly; multiple
tips are merged into a throwaway **merge head** branch. Base is always `main`.

**Run-scoped** — A run stacks only on work completed *within that run* or
already in `main`. It does not adopt another run's unmerged work as a parent;
cross-run dependencies wait for a human merge.
