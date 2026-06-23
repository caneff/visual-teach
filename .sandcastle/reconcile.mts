// Reconciliation sweep — restore the `in-review ⟺ open PR` invariant (issue #143).
//
// An `in-review` issue means "implemented + reviewed OK; PR pending a human
// merge". But the label is set EAGERLY mid-run while the PR is created LAZILY
// at end-of-run (Phase 3). A crash between those points leaves the issue
// `in-review` with no PR — stranded. The sweep runs once at run start to
// detect and route stranded issues before the plan loop.
//
// Detection uses the PRs passed in (fetched via `gh pr list --search "Closes
// #<id>"` by the caller). Each in-review issue is classified by three mutually
// exclusive conditions (table from the issue):
//
//   open PR exists         → genuinely human-gated; leave untouched
//   closed-unmerged PR     → human vetoed the bot's PR; relabel ready-for-human
//   no PR at all           → stranded; route into Phase 3 or re-queue
//
// Pure functions: no git or gh calls. Dependencies are injected so tests can
// drive each branch without a real repo.

export type PRState = "OPEN" | "CLOSED" | "MERGED";

export interface PRInfo {
  number: number;
  state: PRState;
}

export type InReviewClassification =
  | { kind: "open-pr"; prNumber: number }
  | { kind: "vetoed"; prNumber: number }
  | { kind: "stranded-with-work" }
  | { kind: "stranded-no-work" };

// Classify a single in-review issue.
//
// `prs`           — PRs that reference this issue (from `closingIssuesReferences`)
// `branchHasWork` — returns true when `sandcastle/issue-<id>` has a non-empty
//                   three-dot diff vs main
export function classifyInReview(
  issueId: string,
  prs: PRInfo[],
  branchHasWork: (branch: string) => boolean
): InReviewClassification {
  const openPR = prs.find((p) => p.state === "OPEN");
  if (openPR) return { kind: "open-pr", prNumber: openPR.number };

  const closedPR = prs.find((p) => p.state === "CLOSED");
  if (closedPR) return { kind: "vetoed", prNumber: closedPR.number };

  // Only merged PRs, or no PRs at all.
  // A merged PR means the work landed in main — leave untouched rather than
  // risking a spurious re-implement of already-merged work.
  const mergedPR = prs.find((p) => p.state === "MERGED");
  if (mergedPR) return { kind: "open-pr", prNumber: mergedPR.number };

  // No PRs at all — stranded. Check if the branch still carries the work.
  const branch = `sandcastle/issue-${issueId}`;
  if (branchHasWork(branch)) return { kind: "stranded-with-work" };
  return { kind: "stranded-no-work" };
}
