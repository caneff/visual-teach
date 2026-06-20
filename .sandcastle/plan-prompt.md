# ISSUES

Here are the open issues in the repo:

<issues-json>

!`gh issue list --state open --label ready-for-agent --limit 100 --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'`

</issues-json>

The list above has already been filtered to issues ready for work. **Only these `ready-for-agent` issues may appear in your plan.**

# ALREADY IN FLIGHT (context only — never select these)

These issues are already implemented but not yet merged into `main` (in review, or awaiting re-review). They are upcoming changes to `main`. **Do NOT put any of them in your plan** — they are not selectable. But you MUST treat each as a potential **blocker**: if a `ready-for-agent` issue depends on one of these (needs its code, or edits the same files), it is blocked this run and must be excluded until the in-flight issue merges.

<in-flight-json>

!`gh issue list --search "label:in-review,needs-review state:open" --limit 100 --json number,title,body,labels --jq '[.[] | {number, title, body, labels: [.labels[].name]}]'`

</in-flight-json>

# TASK

Analyze the issues and build a dependency graph. For each `ready-for-agent` issue, determine whether it **is blocked by** any other open issue — whether that other issue is `ready-for-agent` or already **in flight** (the list above).

An issue B is **blocked by** issue A if:

- B requires code or infrastructure that A introduces
- B and A modify overlapping files or modules, making concurrent work likely to produce merge conflicts
- B's requirements depend on a decision or API shape that A will establish

An issue is **unblocked** if it has zero blocking dependencies on any other open issue, ready-for-agent or in-flight.

For each unblocked issue, assign a branch name using the exact format `sandcastle/issue-{id}` (no slug or other suffix). This must be deterministic so that re-planning the same issue always produces the same branch name and accumulated progress is preserved.

# OUTPUT

Output your plan as a JSON object wrapped in `<plan>` tags:

<plan>
{"issues": [{"id": "42", "title": "Fix auth bug", "branch": "sandcastle/issue-42"}]}
</plan>

Include only unblocked `ready-for-agent` issues. If every ready-for-agent issue is blocked **only** by other ready-for-agent issues (not by in-flight work), include the single highest-priority candidate (the one with the fewest or weakest dependencies). But if the remaining issues are blocked by **in-flight** work, do NOT force-pick them — leave them out and emit an empty plan; they unblock once that work merges.

Always emit the `<plan>` tags, even when there is nothing to do. If there are no issues to work on at all, output `<plan>{"issues": []}</plan>` so the run can exit cleanly.
