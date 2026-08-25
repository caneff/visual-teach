# TASK

Open ONE pull request against `{{BASE}}` for the work on `{{BRANCH}}` that just
passed review. Do NOT merge the PR. Open it **ready for review**, never as a
draft — two agent reviewers already vetted this branch; it is waiting on a human.

- Headline issue: **#{{ISSUE_ID}} — {{ISSUE_TITLE}}**
- Delivers (auto-closed on merge): see the `Closes` lines under **Summary**. One
  PR may deliver several issues — a whole spec's tickets land on one branch.
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
2. Write the PR title (one line, see **Title** below) to
   `.sandcastle/logs/pr-title-{{ISSUE_ID}}.txt`.
3. `gh pr create --base {{BASE}} --head {{BRANCH}} --title "$(cat .sandcastle/logs/pr-title-{{ISSUE_ID}}.txt)" --body-file .sandcastle/logs/pr-body-{{ISSUE_ID}}.md`

**Use `--body-file` and the title file, never inline `--body` or a raw
`--title` string.** Both can contain backticks and `#`; passed inline they
trigger shell command substitution and corrupt the PR. `"$(cat ...)"` keeps the
title's own characters intact.

## Title

Write ONE line to `.sandcastle/logs/pr-title-{{ISSUE_ID}}.txt`. Start it with
`Sandcastle: ` (this marks the PR's origin), then write a specific, readable
synopsis of what the whole branch does — not the raw headline ticket title.
Read the diff first and name the real change. If the PR delivers several
tickets, the title covers the shared theme, not one ticket.

- Good: `Sandcastle: stack PRs bottom-up and resolve each child's base branch`
- Bad: `Sandcastle: #343 fix base` (just the ticket title)

Keep it under ~70 characters. Use plain words and an active verb.

Build the body in `.sandcastle/logs/pr-body-{{ISSUE_ID}}.md` with these sections:

## Summary

A full synopsis of what this PR does — a short paragraph, not one line, and not
a file list. Describe the behavior a reviewer will see: what changed, why, and
what the branch delivers as a whole. Write it so someone who never read the
tickets understands the PR from this paragraph alone.

If `{{BASE}}` is not `main`, open the paragraph with a note that this PR is
**STACKED on `{{BASE}}`** and that the stack merges bottom-up — the base PR
first, this one after.

## What's included

A numbered list, one item per ticket this PR delivers. For each ticket, write
the issue number and a one-sentence description of what it added or fixed —
readable prose, not the bare ticket title. Read the issue numbers off the
`Closes` lines below; run `gh issue view <n> --json title,body` on each if you
need its intent. Example:

1. **#343** — Resolve each child PR's base to its parent branch, so a stacked
   child no longer targets `main` by mistake.
2. **#344** — Note the stack order in the body so a reviewer merges bottom-up.

## Closes

End with the closing lines below, each on its own line and exactly as given, so
the squash-merge auto-closes every issue this PR delivers and unblocks their
children on the next run:

{{CLOSES}}

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
orchestrator manages issue lifecycle state host-side. The `Closes` lines close
their issues when I squash-merge the PR manually.

Once the PR is open, output <promise>COMPLETE</promise>.
