// Base-branch resolution for the dependency forest.
//
// Each issue's branch is cut from its "base" — the ref it forks from. The base
// is decided purely from the issue's declared `parents` (the issue ids it builds
// on, emitted by the planner) plus one fact about each parent: does its issue
// branch exist locally with work not already in `main`?
//
//   0 parents                          → `main` (a root chain off main).
//   1 parent, branch present this run  → `sandcastle/issue-<parent>` (stack on it).
//   1 parent, branch absent / merged   → `main` (parent landed in an earlier run;
//                                        its work is already in main, so main is
//                                        the right base and avoids re-importing
//                                        an obsolete branch).
//
// ≥2 parents (diamond / multi-parent) is OUT OF SCOPE for this issue — that needs
// a host-built temp merge base and is tracked separately (issue #128). Callers
// pass `onMultiParent` to decide what to do when they hit one; the default falls
// back to `main` so a mis-declared extra parent degrades to "build on main"
// rather than crashing the run.
//
// This is a pure function: it takes the parents and a predicate, never touches
// git itself, so it is unit-testable without a repository. The orchestrator
// supplies a real `branchExistsWithWork` backed by `git`.

export const issueBranch = (id: string): string => `sandcastle/issue-${id}`;

export interface ResolveBaseOptions {
  // The issue's declared parent ids (from the planner). Empty for a root.
  parents: string[];
  // True when `sandcastle/issue-<id>` exists locally AND carries work not yet in
  // `main` (i.e. it was built this run and hasn't been merged). False when the
  // branch is absent or its work already landed in main.
  branchExistsWithWork: (parentId: string) => boolean;
  // Invoked for the ≥2-parent case (deferred to #128). Should return the base to
  // use. Defaults to falling back to `main`.
  onMultiParent?: (parents: string[]) => string;
}

// Resolve the base ref an issue's branch should be cut from. See file header.
export function resolveBase({
  parents,
  branchExistsWithWork,
  onMultiParent = () => "main",
}: ResolveBaseOptions): string {
  if (parents.length === 0) return "main";
  if (parents.length === 1) {
    const [parent] = parents;
    return branchExistsWithWork(parent) ? issueBranch(parent) : "main";
  }
  // ≥2 parents: deferred to #128. Default behavior is a safe fall back to main.
  return onMultiParent(parents);
}
