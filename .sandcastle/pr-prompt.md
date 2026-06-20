# TASK

Open ONE consolidated pull request into `main` for everything completed in this
run. Do NOT open a PR per branch. Do NOT merge the PR into `main`.

The run branch to create and use is: `{{RUN_BRANCH}}`

These are the completed issue branches to fold in:

{{BRANCHES}}

# BUILD THE RUN BRANCH

1. Start from an up-to-date main:
   `git fetch origin && git checkout main && git pull --ff-only`
2. Create the run branch: `git checkout -b {{RUN_BRANCH}}`
3. Merge each completed issue branch into it, in the order listed:
   `git merge --no-ff origin/<branch> -m "Merge <branch>"` (fetch the branch
   first if it is not local: `git fetch origin <branch>`).
   - If a merge conflicts, resolve it preserving BOTH issues' intent, run
     `npm run lint && npm run typecheck && npm run test`, then commit the
     resolution. If you cannot resolve a branch cleanly, skip it, and record the
     skip prominently in the PR body under a `## Skipped` heading.
4. After all merges, run `npm run lint && npm run typecheck && npm run test` once
   on the combined branch. Everything must pass before you open the PR.
5. Push: `git push -u origin {{RUN_BRANCH}}`

# OPEN THE PR

`gh pr create --base main --head {{RUN_BRANCH}} --title "Sandcastle run: <N> issues" --body "<body>"`
where `<N>` is the number of issues actually folded in. Build `<body>` with these
sections:

## Summary

One or two sentences on what this run delivered overall.

## Changes

One subsection per issue that made it in. For each:

- A `### #<id> — <title>` heading.
- 1-3 bullets describing the actual change (read the issue's commits/diff with
  `git log` / `git diff main...{{RUN_BRANCH}} -- <paths>`; describe behavior, not
  file lists).
- A `Closes #<id>` line so the squash-merge auto-closes every issue.

## Visual proof

This `## Visual proof` heading is the ONLY one — emit it exactly once. For each
issue, paste the body of its `.sandcastle/proof/issue-<id>/PROOF.md` (the
implementer uploaded the before/after screenshots as `visual-proof` release
assets and committed the embed block). Each PROOF.md should start with a
`### #<id>` subheading; if an older one instead starts with its own
`## Visual proof` line, drop that line so the heading isn't printed twice. If an
issue has no `PROOF.md`, note "#<id>: no visual change (docs/tooling only)".

## QA checklist

A checklist of concrete things I should verify myself before approving. Include
one item per user-visible change, plus any risky or uncertain area you hit while
merging. Derive each item from the actual diffs in this run, not generic
boilerplate, and favor things a human must eyeball or click that tests do not
cover. Examples of the right altitude (adapt to the real changes):

- [ ] Open a lesson with a `vt-split` of two code blocks at ~1100px; confirm no
      horizontal page scroll and neither panel clips.
- [ ] Check the quiz options render inline code (not "re dot findall").
- [ ] Toggle dark mode on `demo/showcase.html`; confirm the changed block still
      reads.

# AFTER OPENING

Do NOT push to `main`. Do NOT merge the PR. Do NOT touch issue labels — the
orchestrator manages issue lifecycle state (ready-for-agent → in-review →
closed) host-side. The `Closes #<id>` lines close each issue when I
squash-merge the PR manually.

# ISSUES (reference)

{{ISSUES}}

Once the single consolidated PR is open, output <promise>COMPLETE</promise>.
