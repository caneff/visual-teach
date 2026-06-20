import { describe, it, expect, beforeEach } from "vitest";
import { markFlowRows } from "../assets/visual-teach.js";

function makeFlow(childCount) {
  const flow = document.createElement("div");
  flow.className = "vt-flow";
  for (let i = 0; i < childCount; i++) {
    const span = document.createElement("span");
    span.className = "vt-node";
    span.textContent = `Stage ${i + 1}`;
    flow.appendChild(span);
  }
  document.body.appendChild(flow);
  return flow;
}

// Stub offsetTop / offsetHeight so jsdom simulates a 2-row layout.
// Items 0–2 sit on row 1 (top:0, height:30); items 3–5 on row 2 (top:40, height:30).
function mockLayout(flow, rowBreakAt) {
  Array.from(flow.children).forEach((child, i) => {
    const onRow2 = i >= rowBreakAt;
    Object.defineProperty(child, "offsetTop", {
      get: () => (onRow2 ? 40 : 0),
      configurable: true,
    });
    Object.defineProperty(child, "offsetHeight", {
      get: () => 30,
      configurable: true,
    });
  });
}

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("markFlowRows", () => {
  it("adds vt-row-start to the first child on each wrapped row", () => {
    const flow = makeFlow(6);
    mockLayout(flow, 3); // items 3,4,5 are on row 2
    markFlowRows(flow);
    const children = Array.from(flow.children);
    expect(children[0].classList.contains("vt-row-start")).toBe(false); // first item: no arrow anyway
    expect(children[1].classList.contains("vt-row-start")).toBe(false);
    expect(children[2].classList.contains("vt-row-start")).toBe(false);
    expect(children[3].classList.contains("vt-row-start")).toBe(true); // first on row 2
    expect(children[4].classList.contains("vt-row-start")).toBe(false);
    expect(children[5].classList.contains("vt-row-start")).toBe(false);
  });

  it("adds no vt-row-start classes when all items fit on one row", () => {
    const flow = makeFlow(3);
    // All items at offsetTop:0, height:30 — single row
    Array.from(flow.children).forEach((child) => {
      Object.defineProperty(child, "offsetTop", {
        get: () => 0,
        configurable: true,
      });
      Object.defineProperty(child, "offsetHeight", {
        get: () => 30,
        configurable: true,
      });
    });
    markFlowRows(flow);
    expect(
      Array.from(flow.children).some((c) =>
        c.classList.contains("vt-row-start")
      )
    ).toBe(false);
  });

  it("handles 3 rows correctly", () => {
    const flow = makeFlow(9);
    // Row 1: 0-2 (top:0), Row 2: 3-5 (top:40), Row 3: 6-8 (top:80)
    Array.from(flow.children).forEach((child, i) => {
      const top = i < 3 ? 0 : i < 6 ? 40 : 80;
      Object.defineProperty(child, "offsetTop", {
        get: () => top,
        configurable: true,
      });
      Object.defineProperty(child, "offsetHeight", {
        get: () => 30,
        configurable: true,
      });
    });
    markFlowRows(flow);
    const children = Array.from(flow.children);
    expect(children[0].classList.contains("vt-row-start")).toBe(false);
    expect(children[3].classList.contains("vt-row-start")).toBe(true);
    expect(children[6].classList.contains("vt-row-start")).toBe(true);
  });

  it("resets stale vt-row-start marks on re-run", () => {
    const flow = makeFlow(4);
    // First: items 2,3 on row 2
    Array.from(flow.children).forEach((child, i) => {
      const top = i < 2 ? 0 : 40;
      Object.defineProperty(child, "offsetTop", {
        get: () => top,
        configurable: true,
      });
      Object.defineProperty(child, "offsetHeight", {
        get: () => 30,
        configurable: true,
      });
    });
    markFlowRows(flow);
    expect(flow.children[2].classList.contains("vt-row-start")).toBe(true);

    // Simulate resize: all items now fit on one row
    Array.from(flow.children).forEach((child) => {
      Object.defineProperty(child, "offsetTop", {
        get: () => 0,
        configurable: true,
      });
    });
    markFlowRows(flow);
    expect(
      Array.from(flow.children).some((c) =>
        c.classList.contains("vt-row-start")
      )
    ).toBe(false);
  });

  it("handles empty flow without throwing", () => {
    const flow = document.createElement("div");
    flow.className = "vt-flow";
    document.body.appendChild(flow);
    expect(() => markFlowRows(flow)).not.toThrow();
  });
});
