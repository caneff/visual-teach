// Connected-component detection for per-component PRs (issue #127).
//
// A run builds a dependency FOREST: each issue's branch is cut from its parent's
// branch (or main). At PR time we open ONE pull request per connected component
// of that forest — a set of issues transitively linked by parent edges. The
// components are genuinely independent off main (no shared commits), so their
// PRs merge in any order with no rebase surgery.
//
// Only edges to parents ALSO completed this run count. A parent already in main
// (it landed in an earlier run) is not part of this run's forest, so it does not
// pull its dependent into a component — the dependent stands alone off main.
//
// Pure function: no git, unit-testable. The orchestrator passes the issues it
// recorded as `done` this run.

export interface CompletedIssue {
  id: string;
  title: string;
  branch: string;
  parents: string[];
}

export interface PrComponent {
  // Every issue in this connected component.
  issues: CompletedIssue[];
  // Leaf tips: members no other member of this component builds on. A child
  // branch transitively contains its ancestors, so merging just the leaves pulls
  // in the whole component exactly once. A linear chain has one leaf; a fork has
  // several; a diamond collapses back to one.
  leaves: CompletedIssue[];
}

// Partition completed issues into connected components by parent edges, each with
// its leaf tips. Component order follows first appearance in `issues`.
export function prComponents(issues: CompletedIssue[]): PrComponent[] {
  const present = new Set(issues.map((i) => i.id));

  // Union-find over issue ids. Only edges between two completed issues union.
  const parent = new Map<string, string>(issues.map((i) => [i.id, i.id]));
  const find = (x: string): string => {
    let root = x;
    while (parent.get(root) !== root) root = parent.get(root)!;
    // Path compression.
    let cur = x;
    while (parent.get(cur) !== root) {
      const next = parent.get(cur)!;
      parent.set(cur, root);
      cur = next;
    }
    return root;
  };
  const union = (a: string, b: string): void => {
    parent.set(find(a), find(b));
  };
  for (const issue of issues) {
    for (const p of issue.parents) {
      if (present.has(p)) union(issue.id, p);
    }
  }

  // Issues referenced as a parent BY A FELLOW completed issue are not leaves.
  const referencedParents = new Set(
    issues.flatMap((i) => i.parents).filter((p) => present.has(p))
  );

  // Group by component root, preserving first-appearance order.
  const components = new Map<string, PrComponent>();
  for (const issue of issues) {
    const root = find(issue.id);
    if (!components.has(root)) components.set(root, { issues: [], leaves: [] });
    const comp = components.get(root)!;
    comp.issues.push(issue);
    if (!referencedParents.has(issue.id)) comp.leaves.push(issue);
  }
  return [...components.values()];
}
