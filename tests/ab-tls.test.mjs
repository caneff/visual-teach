/**
 * Contract tests for the TLS-WITH A/B experiment (issue #108).
 *
 * These tests verify that:
 *   1. Both arms exist and have all three lessons
 *   2. The monolith arm uses the expected template-heavy block set
 *   3. The split arm has selective-load comments in each lesson
 *   4. No two split-arm lessons open the same set of block files
 *   5. FINDINGS.md exists and covers the four required metrics
 *   6. Coverage parity: both arms mention the same key TLS concepts
 */

import { test, expect, describe } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import os from "os";

const home = os.homedir();
const base = join(home, "vt-compare", "tls");

// These tests require an artifact directory produced by running the A/B
// experiment. Skip the whole suite when that directory is absent.
const skip = !existsSync(base);

const arms = {
  monolith: join(base, "with"),
  split: join(base, "with-split"),
};
const lessons = ["tls-01.html", "tls-02.html", "tls-03.html"];

function read(armDir, file) {
  return readFileSync(join(armDir, file), "utf8");
}

describe.skipIf(skip)("TLS A/B experiment", () => {
  // ── Directory structure ──────────────────────────────────────────
  test("~/vt-compare/tls/PROTOCOL.md exists", () => {
    expect(existsSync(join(base, "PROTOCOL.md"))).toBe(true);
  });

  test("~/vt-compare/tls/FINDINGS.md exists", () => {
    expect(existsSync(join(base, "FINDINGS.md"))).toBe(true);
  });

  test("~/vt-compare/tls/analysis.mjs exists", () => {
    expect(existsSync(join(base, "analysis.mjs"))).toBe(true);
  });

  test("monolith arm: all three lessons exist", () => {
    for (const f of lessons) {
      expect(existsSync(join(arms.monolith, f))).toBe(true);
    }
  });

  test("split arm: all three lessons exist", () => {
    for (const f of lessons) {
      expect(existsSync(join(arms.split, f))).toBe(true);
    }
  });

  // ── Monolith arm: template-heavy block pattern ───────────────────
  test("monolith arm: each lesson uses vt-objectives", () => {
    for (const f of lessons) {
      expect(read(arms.monolith, f)).toContain("vt-objectives");
    }
  });

  test("monolith arm: each lesson uses vt-quiz", () => {
    for (const f of lessons) {
      expect(read(arms.monolith, f)).toContain("vt-quiz");
    }
  });

  test("monolith arm: each lesson uses vt-teacher", () => {
    for (const f of lessons) {
      expect(read(arms.monolith, f)).toContain("vt-teacher");
    }
  });

  // ── Split arm: selective-load discipline ─────────────────────────
  test("split arm: each lesson has a selective-load comment", () => {
    for (const f of lessons) {
      const html = read(arms.split, f);
      expect(html).toMatch(/Blocks opened:/i);
    }
  });

  test("split arm: no two lessons open the same set of block files", () => {
    const loadedSets = lessons.map((f) => {
      const html = read(arms.split, f);
      const m = html.match(/Blocks opened:\s*([^\n]+)/i);
      if (!m) return "";
      return m[1]
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .sort()
        .join(",");
    });
    const unique = new Set(loadedSets);
    expect(unique.size).toBe(3);
  });

  test("split arm: each lesson opens fewer than all 7 block files", () => {
    const allBlocks = 7;
    for (const f of lessons) {
      const html = read(arms.split, f);
      const m = html.match(/Blocks opened:\s*([^\n]+)/i);
      if (!m) continue;
      const count = m[1].split(",").length;
      expect(count).toBeLessThan(allBlocks);
    }
  });

  // ── Split arm: structural variety ───────────────────────────────
  test("split arm: at least one lesson uses vt-code (code-io block)", () => {
    const anyHasCode = lessons.some((f) =>
      read(arms.split, f).includes("vt-code")
    );
    expect(anyHasCode).toBe(true);
  });

  test("split arm: at least one lesson uses vt-diagram (diagrams block)", () => {
    const anyHasDiagram = lessons.some((f) =>
      read(arms.split, f).includes("vt-diagram")
    );
    expect(anyHasDiagram).toBe(true);
  });

  test("split arm: at least one lesson uses vt-checklist (quizzes-checklist block)", () => {
    const anyHasChecklist = lessons.some((f) =>
      read(arms.split, f).includes("vt-checklist")
    );
    expect(anyHasChecklist).toBe(true);
  });

  // ── Coverage parity ──────────────────────────────────────────────
  const keyConcepts = ["TLS", "certificate", "handshake", "cipher"];

  test("coverage parity: both arms mention key TLS concepts across all lessons", () => {
    for (const arm of Object.values(arms)) {
      const allText = lessons.map((f) => read(arm, f)).join(" ");
      for (const concept of keyConcepts) {
        expect(allText.toLowerCase()).toContain(concept.toLowerCase());
      }
    }
  });

  // ── FINDINGS.md content ──────────────────────────────────────────
  test("FINDINGS.md covers all four required metrics", () => {
    const findings = readFileSync(join(base, "FINDINGS.md"), "utf8");
    expect(findings).toMatch(/skeleton uniformity/i);
    expect(findings).toMatch(/teacher.box variation/i);
    expect(findings).toMatch(/selective.load/i);
    expect(findings).toMatch(/coverage parity/i);
  });

  test("FINDINGS.md includes n=1 caveat", () => {
    const findings = readFileSync(join(base, "FINDINGS.md"), "utf8");
    expect(findings).toMatch(/n=1/i);
  });

  test("FINDINGS.md reports monolith avg pairwise similarity above 0.7", () => {
    const findings = readFileSync(join(base, "FINDINGS.md"), "utf8");
    // Monolith should show high similarity (template stamping)
    expect(findings).toMatch(/0\.[78]\d\s*avg pairwise similarity/i);
  });

  test("FINDINGS.md reports split avg pairwise similarity below 0.5", () => {
    const findings = readFileSync(join(base, "FINDINGS.md"), "utf8");
    // Split should show lower similarity (varied structure)
    expect(findings).toMatch(/0\.[0-4]\d\s*avg pairwise similarity/i);
  });

  // ── PROTOCOL.md structure ────────────────────────────────────────
  test("PROTOCOL.md contains the locked prompt", () => {
    const protocol = readFileSync(join(base, "PROTOCOL.md"), "utf8");
    expect(protocol).toContain("locked prompt");
    expect(protocol).toMatch(/TLS/i);
    expect(protocol).toMatch(/lesson/i);
  });

  test("PROTOCOL.md documents both arms", () => {
    const protocol = readFileSync(join(base, "PROTOCOL.md"), "utf8");
    expect(protocol).toContain("Monolith");
    expect(protocol).toContain("Split");
  });
});
