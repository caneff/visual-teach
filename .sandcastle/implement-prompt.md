# TASK

Fix issue {{TASK_ID}}: {{ISSUE_TITLE}}

Pull in the issue using `gh issue view <ID>`. If it has a parent PRD, pull that in too.

Only work on the issue specified.

Work on branch {{BRANCH}}. Make commits and run tests.

# CONTEXT

Here are the last 10 commits:

<recent-commits>

!`git log -n 10 --format="%H%n%ad%n%B---" --date=short`

</recent-commits>

# EXPLORATION

Explore the repo and fill your context window with relevant information that will allow you to complete the task.

Pay extra attention to test files that touch the relevant parts of the code.

# EXECUTION

Use the **`/tdd` skill** (vendored at `.claude/skills/tdd/`) and follow it — do
not improvise your own test rhythm. Its load-bearing rules: one vertical slice
at a time (RED: one failing test → GREEN: minimal code to pass → REPEAT), never
write all tests first then all code, test observable behavior through the public
interface (not source shape), refactor only once green.

# FEEDBACK LOOPS

Before committing, run `npm run typecheck` and `npm run test` to ensure the tests pass.

# VISUAL PROOF (before / after)

Follow the shared visual-proof protocol in `.sandcastle/proof-protocol.md`, using
`<id>` = `{{TASK_ID}}`. This is new work, so capture **both** before (on the
unchanged code, before you edit) and after, upload both to R2, and write
`.sandcastle/proof/issue-{{TASK_ID}}/PROOF.md`.

# COMMIT

Make a git commit. The commit message must:

1. Start with `RALPH:` prefix
2. Include task completed + PRD reference
3. Key decisions made
4. Files changed
5. Blockers or notes for next iteration

Keep it concise.

# THE ISSUE

If the task is not complete, leave a comment on the issue with what was done.

Do not close the issue - this will be done later.

Once complete, output <promise>COMPLETE</promise>.

# FINAL RULES

ONLY WORK ON A SINGLE TASK.
