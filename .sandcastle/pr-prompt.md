# TASK

Open a pull request for each of these branches into `main` (do NOT merge):

{{BRANCHES}}

For each branch:

1. `git push -u origin <branch>`
2. `gh pr create --base main --head <branch> --fill`
3. Append a `Closes #<id>` line to the PR body so the squash-merge auto-closes
   the issue. The branch is `sandcastle/issue-<id>`, so the issue is `<id>`.
   Read the body created by `--fill`, then re-set it with the line appended:
   `gh pr edit <branch> --body "$(gh pr view <branch> --json body --jq .body)"$'\n\nCloses #<id>'`
4. Remove the `ready-for-agent` label from the matching issue so the planner
   stops re-selecting it while the PR is open:
   `gh issue edit <id> --remove-label ready-for-agent`

Do not run `git merge`. Do not push to `main`. Do NOT close the issues — leave
them open until I merge the PR manually. Removing the label is enough to take
them out of the planner's candidate pool.

# ISSUES

For reference only:

{{ISSUES}}

Once every branch has a PR, output <promise>COMPLETE</promise>.
