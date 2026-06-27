import { describe, it, expect } from "vitest";
import { JSDOM } from "jsdom";
import vtVisualTeach from "../skills/visual-teach/assets/components/diagram/diagram.js";

describe("vt-flow markFlowRows", () => {
  it("exports markFlowRows", () => {
    expect(typeof vtVisualTeach.markFlowRows).toBe("function");
  });

  let dom, flow;

  function makeFlow(count) {
    dom = new JSDOM(
      `<div class="vt-flow">${"<span></span>".repeat(count)}</div>`
    );
    flow = dom.window.document.querySelector(".vt-flow");
    return flow;
  }

  function setOffsetTop(child, top, height = 20) {
    Object.defineProperty(child, "offsetTop", {
      value: top,
      configurable: true,
    });
    Object.defineProperty(child, "offsetHeight", {
      value: height,
      configurable: true,
    });
  }

  it("marks nothing when all items share the same row (same offsetTop)", () => {
    makeFlow(4);
    Array.from(flow.children).forEach((c) => setOffsetTop(c, 0));
    vtVisualTeach.markFlowRows(flow);
    const marked = Array.from(flow.children).filter((c) =>
      c.classList.contains("vt-row-start")
    );
    expect(marked.length).toBe(0);
  });

  it("marks the first child of each wrapped row with vt-row-start", () => {
    makeFlow(5);
    const kids = Array.from(flow.children);
    // Row 1: items 0,1,2 at offsetTop=0; Row 2: items 3,4 at offsetTop=30
    setOffsetTop(kids[0], 0, 20);
    setOffsetTop(kids[1], 0, 20);
    setOffsetTop(kids[2], 0, 20);
    setOffsetTop(kids[3], 30, 20);
    setOffsetTop(kids[4], 30, 20);
    vtVisualTeach.markFlowRows(flow);
    expect(kids[0].classList.contains("vt-row-start")).toBe(false);
    expect(kids[1].classList.contains("vt-row-start")).toBe(false);
    expect(kids[2].classList.contains("vt-row-start")).toBe(false);
    expect(kids[3].classList.contains("vt-row-start")).toBe(true);
    expect(kids[4].classList.contains("vt-row-start")).toBe(false);
  });

  it("marks the first child of each row in a 3-row wrap", () => {
    makeFlow(6);
    const kids = Array.from(flow.children);
    // Row 1: 0,1 at top=0; Row 2: 2,3 at top=30; Row 3: 4,5 at top=60
    const tops = [0, 0, 30, 30, 60, 60];
    tops.forEach((t, i) => setOffsetTop(kids[i], t, 20));
    vtVisualTeach.markFlowRows(flow);
    const rowStarts = kids.map((c) => c.classList.contains("vt-row-start"));
    expect(rowStarts).toEqual([false, false, true, false, true, false]);
  });

  it("is idempotent — calling twice leaves the same marks", () => {
    makeFlow(4);
    const kids = Array.from(flow.children);
    setOffsetTop(kids[0], 0, 20);
    setOffsetTop(kids[1], 0, 20);
    setOffsetTop(kids[2], 30, 20);
    setOffsetTop(kids[3], 30, 20);
    vtVisualTeach.markFlowRows(flow);
    vtVisualTeach.markFlowRows(flow);
    const rowStarts = kids.map((c) => c.classList.contains("vt-row-start"));
    expect(rowStarts).toEqual([false, false, true, false]);
  });

  it("clears stale vt-row-start marks on re-run", () => {
    makeFlow(4);
    const kids = Array.from(flow.children);
    // First call: items 2,3 wrap
    setOffsetTop(kids[0], 0, 20);
    setOffsetTop(kids[1], 0, 20);
    setOffsetTop(kids[2], 30, 20);
    setOffsetTop(kids[3], 30, 20);
    vtVisualTeach.markFlowRows(flow);
    expect(kids[2].classList.contains("vt-row-start")).toBe(true);

    // Second call: now all on same row (e.g. after resize)
    [kids[2], kids[3]].forEach((c) => setOffsetTop(c, 0, 20));
    vtVisualTeach.markFlowRows(flow);
    expect(kids[2].classList.contains("vt-row-start")).toBe(false);
  });

  it("marks the correct row-start in an RTL flow — offsetTop is direction-agnostic", () => {
    // Under RTL flex, DOM-order item[0] is placed at the far RIGHT (first in reading order).
    // When items wrap, DOM-order item[N] is the rightmost (reading-order first) on the new row.
    // markFlowRows detects this via offsetTop just as in LTR, so the same item gets vt-row-start.
    dom = new JSDOM(
      `<div class="vt-flow" dir="rtl">${"<span></span>".repeat(5)}</div>`
    );
    flow = dom.window.document.querySelector(".vt-flow");
    const kids = Array.from(flow.children);
    // Simulate RTL wrap: items 0,1,2 on row 1; items 3,4 on row 2
    setOffsetTop(kids[0], 0, 20);
    setOffsetTop(kids[1], 0, 20);
    setOffsetTop(kids[2], 0, 20);
    setOffsetTop(kids[3], 30, 20);
    setOffsetTop(kids[4], 30, 20);
    vtVisualTeach.markFlowRows(flow);
    // item[3] is the reading-order first on row 2 (rightmost in RTL) — must be suppressed
    expect(kids[0].classList.contains("vt-row-start")).toBe(false);
    expect(kids[1].classList.contains("vt-row-start")).toBe(false);
    expect(kids[2].classList.contains("vt-row-start")).toBe(false);
    expect(kids[3].classList.contains("vt-row-start")).toBe(true);
    expect(kids[4].classList.contains("vt-row-start")).toBe(false);
  });
});
