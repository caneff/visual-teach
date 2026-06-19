# TASK

Open a pull request for each of these branches into `main` (do NOT merge):

{{BRANCHES}}

For each branch:

1. `git push -u origin <branch>`
2. `gh pr create --base main --head <branch> --fill`

Do not run `git merge`. Do not push to `main`.

# ISSUES

For reference only — do NOT close these. Leave them open until I merge the PR
manually:

{{ISSUES}}

Once every branch has a PR, output <promise>COMPLETE</promise>.
