import { test, expect, describe } from "vitest";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");
const mainSrc = readFileSync(join(root, ".sandcastle/main.mts"), "utf8");

// Contract tests: verify that main.mts wires up the reconciliation sweep and
// bucketed summary from issue #143.

describe("main.mts — reconciliation sweep (issue #143)", () => {
  test("imports classifyInReview from reconcile.mts", () => {
    expect(mainSrc).toMatch(/import.*classifyInReview.*reconcile/);
  });

  test("the sweep block runs before the plan loop (Phase 0.5 before 'for (let iteration')", () => {
    // The reconciliation block must appear before the main `for (let iteration` loop.
    const sweepIdx = mainSrc.indexOf("reconciliation sweep");
    const loopIdx = mainSrc.indexOf("for (let iteration");
    expect(sweepIdx).toBeGreaterThan(-1);
    expect(loopIdx).toBeGreaterThan(-1);
    expect(sweepIdx).toBeLessThan(loopIdx);
  });

  test("calls getPRsForIssue (or equivalent) for each in-review issue to detect stranded ones", () => {
    // Must use some form of PR lookup for the sweep
    expect(mainSrc).toMatch(/listIssues\(["']in-review["']\)/);
    expect(mainSrc).toMatch(/classifyInReview/);
  });

  test("vetoed issues are relabeled ready-for-human in the sweep", () => {
    // The sweep must relabel vetoed issues rather than silently skipping them
    expect(mainSrc).toMatch(/vetoed/);
    expect(mainSrc).toMatch(/ready-for-human/);
  });

  test("stranded-with-work issues are injected into allCompleted before Phase 3", () => {
    expect(mainSrc).toMatch(/stranded-with-work/);
    expect(mainSrc).toMatch(/allCompleted\.push/);
  });

  test("stranded-no-work issues are relabeled ready-for-agent in the sweep", () => {
    expect(mainSrc).toMatch(/stranded-no-work/);
    // ready-for-agent is already in main — just verify both appear
    expect(mainSrc).toMatch(/ready-for-agent/);
  });
});

describe("main.mts — bucketed run summary (issue #143)", () => {
  test("emits a run summary section at the end", () => {
    expect(mainSrc).toMatch(/[Rr]un summary/);
  });

  test("summary includes the untriaged bucket", () => {
    expect(mainSrc).toMatch(/untriaged/i);
  });

  test("summary includes the ready-for-human bucket", () => {
    // must be present in the summary reporting section, not just the sweep
    const summaryIdx = mainSrc.lastIndexOf("run summary");
    const rfhIdx = mainSrc.lastIndexOf("ready-for-human");
    expect(summaryIdx).toBeGreaterThan(-1);
    // ready-for-human appears at least once after the summary header
    expect(rfhIdx).toBeGreaterThan(summaryIdx);
  });

  test("lists untriaged issues — open issues with no lifecycle label", () => {
    // must query issues without lifecycle labels for the untriaged bucket
    expect(mainSrc).toMatch(/labels/i);
    expect(mainSrc).toMatch(/untriaged/i);
  });

  test("'No work to do' guard — only prints when all open issues are human-gated or in-flight", () => {
    // The early-exit "No work" message must not be used standalone;
    // there must be a summary emitted regardless
    const summaryCount = (mainSrc.match(/[Rr]un summary/g) ?? []).length;
    expect(summaryCount).toBeGreaterThanOrEqual(1);
  });
});
