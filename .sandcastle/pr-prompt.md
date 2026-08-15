# TASK

Open ONE pull request against `{{BASE}}` for a single issue that just passed
review. Do NOT merge the PR. Open it **ready for review**, never as a draft —
two agent reviewers already vetted this branch; it is waiting on a human.

- Issue: **#{{ISSUE_ID}} — {{ISSUE_TITLE}}**
- PR head branch: `{{BRANCH}}` (already built and pushed to `origin`)
- PR base branch: `{{BASE}}`

If `{{BASE}}` is not `main`, this PR is **STACKED**: it targets a sibling PR's
branch instead of `main`, because this issue's work built on top of that
branch within this run. Say so in the PR body (see below) — a human reviewing
it needs to know the stack merges bottom-up, base PR first, or the diff they
see will include the base PR's commits too.

# THE HEAD BRANCH IS ALREADY BUILT AND PUSHED

The orchestrator cut `{{BRANCH}}` from `main`, the implementer committed to it,
and the orchestrator pushed it to `origin`. **Do NOT create, rebuild, merge,
rebase, or otherwise run git that mutates anything.** Your only job is to open
ONE pull request from it and write its prose.

Read-only inspection to write an accurate body is expected:

- `git fetch origin {{BASE}} {{BRANCH}}`
- `git log --oneline origin/{{BASE}}..origin/{{BRANCH}}` — the commits the PR contains.
- `git diff origin/{{BASE}}...origin/{{BRANCH}}` — the full diff, for the body below.

(CI runs lint/typecheck/test on the PR — that is the authoritative gate, so you
do not run them here.)

# OPEN THE PR

Do this in order, in one pass:

1. `mkdir -p .sandcastle/logs`, then write the PR body (sections below) to
   `.sandcastle/logs/pr-body-{{ISSUE_ID}}.md`. Write it there, never in the repo
   root: that directory is gitignored, so the body cannot leave the checkout
   dirty. A stray untracked file in the root makes every later `git status` read
   dirty, which breaks tooling that treats a clean tree as its go signal. The
   `mkdir` matters because `logs/` is gitignored and so is absent from a fresh
   worktree or clone.
2. `gh pr create --base {{BASE}} --head {{BRANCH}} --title "Sandcastle: #{{ISSUE_ID}} {{ISSUE_TITLE}}" --body-file .sandcastle/logs/pr-body-{{ISSUE_ID}}.md`

**Use `--body-file`, never inline `--body`.** The body contains backticks and
`#`; passed inline they trigger shell command substitution and corrupt the PR.

Build the body in `.sandcastle/logs/pr-body-{{ISSUE_ID}}.md` with these sections:

## Summary

One or two sentences on what this issue delivered — describe behavior, not a
file list. If `{{BASE}}` is not `main`, open with a note that this PR is
**STACKED on `{{BASE}}`** and that the stack merges bottom-up — the base PR
first, this one after. End with a `Closes #{{ISSUE_ID}}` line so the
squash-merge auto-closes the issue and unblocks its children on the next run.

<!-- sandcastle:local — this repo's deliverable is a rendered page, so its PR
     body carries the before/after shots the implementer uploaded. No other
     adopter produces a picture to embed. -->

## Visual proof

This `## Visual proof` heading is the ONLY one — emit it exactly once. For each
issue, paste the body of its `.sandcastle/proof/issue-<id>/PROOF.md` (the
implementer uploaded the before/after screenshots to the Cloudflare R2 bucket and
committed the embed block). Each PROOF.md should start with a
`### #<id>` subheading; if an older one instead starts with its own
`## Visual proof` line, drop that line so the heading isn't printed twice. If an
issue has no `PROOF.md`, note "#<id>: no visual change (docs/tooling only)".

## QA checklist

A checklist of concrete things I should verify myself before approving. Include
one item per user-visible change, plus any risky or uncertain area you hit while
merging. Derive each item from the actual diffs in this run, not generic
boilerplate, and favor things a human must eyeball or click that tests do not
cover. Examples of the right altitude (adapt to the real changes):

<!-- sandcastle:local — the template's examples are CLI and pipeline shaped; what
     a human checks by hand here is a rendered lesson at a given width, so the
     examples are this repo's own surfaces. -->

- [ ] Open a lesson with a `vt-split` of two code blocks at ~1100px; confirm no
      horizontal page scroll and neither panel clips.
- [ ] Check the quiz options render inline code (not "re dot findall").
- [ ] Toggle dark mode on `demo/showcase.html`; confirm the changed block still
      reads.

# AFTER OPENING

Do NOT push to `{{BASE}}`. Do NOT merge the PR. Do NOT touch issue labels — the
orchestrator manages issue lifecycle state host-side. The `Closes #{{ISSUE_ID}}`
line closes the issue when I squash-merge the PR manually.

Once the PR is open, output <promise>COMPLETE</promise>.
