import { test, expect, describe } from "vitest";
import { parseSpecVerdict } from "../.sandcastle/review-verdict.mts";

// The reviewer emits a sentinel line because sandbox.run has no structured
// output (issue #130). Gate on an EXPLICIT FAIL only; everything else passes.
describe("parseSpecVerdict", () => {
  test("explicit PASS → pass", () => {
    expect(parseSpecVerdict("work done\nSANDCASTLE_SPEC: PASS\n")).toEqual({
      pass: true,
      reason: "",
    });
  });

  test("explicit FAIL → not pass, captures the reason line", () => {
    const v = parseSpecVerdict(
      "notes...\nSANDCASTLE_SPEC: FAIL — AC2 (dark-mode toggle) not implemented\n<promise>COMPLETE</promise>"
    );
    expect(v.pass).toBe(false);
    expect(v.reason).toContain("AC2 (dark-mode toggle) not implemented");
  });

  test("FAIL with no reason still fails", () => {
    expect(parseSpecVerdict("SANDCASTLE_SPEC: FAIL").pass).toBe(false);
  });

  test("no verdict at all → pass (fail-open on a missing sentinel)", () => {
    expect(parseSpecVerdict("reviewer said nothing useful").pass).toBe(true);
  });

  test("a FAIL buried among other output is still detected", () => {
    const out = [
      "refactored foo",
      "SANDCASTLE_SPEC: FAIL — missing error handling",
      "trailing chatter",
    ].join("\n");
    expect(parseSpecVerdict(out).pass).toBe(false);
  });

  test("the word FAIL elsewhere (not the sentinel) does not trip the gate", () => {
    expect(parseSpecVerdict("the test suite did not FAIL\n").pass).toBe(true);
  });
});
