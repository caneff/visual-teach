# TASK

Open ONE pull request into `main` for the issues listed at the bottom of this
prompt — they are one dependency component of this run (the orchestrator opens a
separate PR per component). Do NOT open a PR per branch. Do NOT merge the PR into
`main`.

The PR head branch is: `{{RUN_BRANCH}}`

# THE HEAD BRANCH IS ALREADY BUILT AND PUSHED

The orchestrator already assembled `{{RUN_BRANCH}}` as a throwaway head off
`main`: it merged in this component's leaf tips (each of which already contains
its whole chain) and pushed the result to `origin`. **Do NOT create, rebuild, merge, rebase, or otherwise run git that
mutates anything.** The head is final — your only job is to open ONE pull request
from it and write its prose.

Read-only inspection to write an accurate body is expected:

- `git fetch origin {{RUN_BRANCH}}`
- `git log --oneline origin/main..origin/{{RUN_BRANCH}}` — these are the commits the PR contains.
- `git diff origin/main...origin/{{RUN_BRANCH}}` — the full diff, for writing the body below.

(CI runs lint/typecheck/test on the PR — that is the authoritative gate, so you
do not run them here.)

# OPEN THE PR

`gh pr create --base main --head {{RUN_BRANCH}} --title "Sandcastle: <N> issue(s)" --body "<body>"`
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
