import { test, expect, describe } from "vitest";
import { resolveBase, issueBranch } from "../.sandcastle/base-resolution.mts";

// Fixture forest (from issue #126):
//   108 builds on 112        → chain  main ─ 112 ─ 108
//   120 builds on 119        → chain  main ─ 119 ─ 120
//   112, 119 are independent roots off main
//
// All four complete in the SAME run, so each parent branch exists locally with
// work not yet in main. Base resolution must put 108 on 112's branch and 120 on
// 119's branch, while 112 and 119 sit on main — proving the two chains stay
// independent off main with no cross-chain interleaving.

const parentsOf = {
  108: ["112"],
  120: ["119"],
  112: [],
  119: [],
};

describe(".sandcastle base resolution — forest fixture 108→112, 120→119", () => {
  // Every issue branch from this run exists locally with work.
  const allBuiltThisRun = () => true;

  test("root 112 resolves to main (no parents)", () => {
    expect(
      resolveBase({
        parents: parentsOf["112"],
        branchExistsWithWork: allBuiltThisRun,
      })
    ).toBe("main");
  });

  test("root 119 resolves to main (no parents)", () => {
    expect(
      resolveBase({
        parents: parentsOf["119"],
        branchExistsWithWork: allBuiltThisRun,
      })
    ).toBe("main");
  });

  test("108 resolves to its parent 112's branch (1 parent, present this run)", () => {
    expect(
      resolveBase({
        parents: parentsOf["108"],
        branchExistsWithWork: allBuiltThisRun,
      })
    ).toBe(issueBranch("112"));
  });

  test("120 resolves to its parent 119's branch (1 parent, present this run)", () => {
    expect(
      resolveBase({
        parents: parentsOf["120"],
        branchExistsWithWork: allBuiltThisRun,
      })
    ).toBe(issueBranch("119"));
  });

  test("108 does NOT resolve onto 119's branch — chains stay independent", () => {
    const base = resolveBase({
      parents: parentsOf["108"],
      branchExistsWithWork: allBuiltThisRun,
    });
    expect(base).not.toBe(issueBranch("119"));
  });

  // Regression guard: this is the failure the self-check exists to catch — a
  // 1-parent issue collapsing to `main` even though its parent branch exists
  // with work would lose the dependency and break the dependent issue's build.
  test("1-parent issue must NOT fall back to main when its parent branch exists with work", () => {
    const base = resolveBase({
      parents: ["112"],
      branchExistsWithWork: allBuiltThisRun,
    });
    expect(base).toBe(issueBranch("112"));
    expect(base).not.toBe("main");
  });

  test("1-parent issue falls back to main when the parent already merged (branch absent / no work)", () => {
    // Parent landed in an earlier run: its work is in main, branch carries no
    // unmerged work. Base is main, not a stale parent branch.
    const base = resolveBase({
      parents: ["112"],
      branchExistsWithWork: () => false,
    });
    expect(base).toBe("main");
  });

  test("≥2 parents with no hook falls back to main", () => {
    expect(
      resolveBase({
        parents: ["112", "119"],
        branchExistsWithWork: allBuiltThisRun,
      })
    ).toBe("main");
  });

  test("≥2 parents (diamond) delegates to onMultiParent and returns its base", () => {
    let seen;
    const base = resolveBase({
      parents: ["112", "119"],
      branchExistsWithWork: allBuiltThisRun,
      onMultiParent: (ps) => {
        seen = ps;
        return "sandcastle/base-130";
      },
    });
    expect(seen).toEqual(["112", "119"]);
    expect(base).toBe("sandcastle/base-130");
  });

  test("a conflicting multi-parent merge propagates null so the caller can skip", () => {
    expect(
      resolveBase({
        parents: ["112", "119"],
        branchExistsWithWork: allBuiltThisRun,
        onMultiParent: () => null,
      })
    ).toBeNull();
  });
});
