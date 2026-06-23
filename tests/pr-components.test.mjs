import { test, expect, describe } from "vitest";
import { prComponents } from "../.sandcastle/pr-components.mts";

// One PR per connected dependency component (issue #127). Components are the
// connected pieces of the parent-edge graph over the issues completed THIS run.
// Only edges to parents also completed this run count — a parent already in main
// is not part of this run's forest, so it does not join components.
//
// Fixture forest (from #126):
//   108 → 112,  120 → 119,  112/119 independent roots
//   →  main ─┬─ 112 ── 108     (component A, leaf 108)
//            └─ 119 ── 120     (component B, leaf 120)

const issue = (id, parents = []) => ({
  id,
  title: `issue ${id}`,
  branch: `sandcastle/issue-${id}`,
  parents,
});

// Compare components by their member id sets, order-independent.
const idSets = (comps) =>
  comps
    .map((c) => c.issues.map((i) => i.id).sort())
    .sort((a, b) => a[0].localeCompare(b[0]));
const leafIds = (comps, memberId) =>
  comps
    .find((c) => c.issues.some((i) => i.id === memberId))
    .leaves.map((l) => l.id)
    .sort();

describe("prComponents — forest fixture 108→112, 120→119", () => {
  const completed = [
    issue("112"),
    issue("119"),
    issue("108", ["112"]),
    issue("120", ["119"]),
  ];

  test("splits the two independent chains into two components", () => {
    expect(idSets(prComponents(completed))).toEqual([
      ["108", "112"],
      ["119", "120"],
    ]);
  });

  test("each component's leaf tip is the chain's child (108, 120)", () => {
    const comps = prComponents(completed);
    expect(leafIds(comps, "112")).toEqual(["108"]);
    expect(leafIds(comps, "119")).toEqual(["120"]);
  });
});

describe("prComponents — non-linear shapes", () => {
  test("a forking component (112→108, 112→109) is ONE component with two leaves", () => {
    const comps = prComponents([
      issue("112"),
      issue("108", ["112"]),
      issue("109", ["112"]),
    ]);
    expect(idSets(comps)).toEqual([["108", "109", "112"]]);
    expect(leafIds(comps, "112")).toEqual(["108", "109"]);
  });

  test("a diamond (130 ← 112,119) is ONE component with a single leaf", () => {
    const comps = prComponents([
      issue("112"),
      issue("119"),
      issue("130", ["112", "119"]),
    ]);
    expect(idSets(comps)).toEqual([["112", "119", "130"]]);
    expect(leafIds(comps, "112")).toEqual(["130"]);
  });

  test("a parent NOT completed this run (merged earlier) does not join a component", () => {
    // 130 builds on 108, but 108 is not in this run's completed set (it landed in
    // an earlier run / is in main). 130 stands alone.
    const comps = prComponents([issue("130", ["108"])]);
    expect(idSets(comps)).toEqual([["130"]]);
    expect(leafIds(comps, "130")).toEqual(["130"]);
  });

  test("a lone root is its own component and its own leaf", () => {
    const comps = prComponents([issue("112")]);
    expect(idSets(comps)).toEqual([["112"]]);
    expect(leafIds(comps, "112")).toEqual(["112"]);
  });

  test("empty input yields no components", () => {
    expect(prComponents([])).toEqual([]);
  });
});
