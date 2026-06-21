import { describe, it, expect } from "vitest";
import vtVisualTeach from "../assets/visual-teach.js";

describe("vt-flow public API", () => {
  it("does not export markFlowRows (row-wrap marking was removed)", () => {
    expect(vtVisualTeach.markFlowRows).toBeUndefined();
  });
});
