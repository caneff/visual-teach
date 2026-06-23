import { test, expect, describe } from "vitest";
import { classifyInReview } from "../.sandcastle/reconcile.mts";

// Unit tests for the in-review reconciliation sweep (issue #143).
// classifyInReview classifies a single in-review issue based on the PRs that
// reference it (passed in) and whether its branch has work. Pure, no git/gh.

const noBranchWork = () => false;
const hasBranchWork = () => true;

describe("classifyInReview — open PR exists", () => {
  test("returns open-pr with the PR number when an open PR references the issue", () => {
    const result = classifyInReview(
      "42",
      [{ number: 7, state: "OPEN" }],
      noBranchWork
    );
    expect(result).toEqual({ kind: "open-pr", prNumber: 7 });
  });

  test("open PR wins even when a closed-unmerged PR also exists", () => {
    const result = classifyInReview(
      "42",
      [
        { number: 5, state: "CLOSED" },
        { number: 7, state: "OPEN" },
      ],
      noBranchWork
    );
    expect(result).toEqual({ kind: "open-pr", prNumber: 7 });
  });
});

describe("classifyInReview — vetoed (closed-unmerged PR, no open PR)", () => {
  test("returns vetoed with the PR number when a closed-unmerged PR references the issue", () => {
    const result = classifyInReview(
      "42",
      [{ number: 5, state: "CLOSED" }],
      noBranchWork
    );
    expect(result).toEqual({ kind: "vetoed", prNumber: 5 });
  });
});

describe("classifyInReview — stranded (no PRs at all)", () => {
  test("stranded-with-work when no PRs exist and the branch has work", () => {
    const result = classifyInReview("42", [], hasBranchWork);
    expect(result).toEqual({ kind: "stranded-with-work" });
  });

  test("stranded-no-work when no PRs exist and the branch has no work", () => {
    const result = classifyInReview("42", [], noBranchWork);
    expect(result).toEqual({ kind: "stranded-no-work" });
  });

  test("branch name passed to branchHasWork is sandcastle/issue-<id>", () => {
    let checkedBranch = "";
    classifyInReview("99", [], (branch) => {
      checkedBranch = branch;
      return false;
    });
    expect(checkedBranch).toBe("sandcastle/issue-99");
  });
});

describe("classifyInReview — merged PRs only (leave untouched)", () => {
  test("returns open-pr (leave-untouched) when only merged PRs reference the issue", () => {
    const result = classifyInReview(
      "42",
      [{ number: 3, state: "MERGED" }],
      noBranchWork
    );
    expect(result).toEqual({ kind: "open-pr", prNumber: 3 });
  });
});
