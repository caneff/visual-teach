import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const SRC = readFileSync(
  join(__dir, "../skills/visual-teach/assets/mermaid.js"),
  "utf8"
);

// Execute the UMD module: in new Function() scope, `module` is not defined so
// the browser branch runs and assigns vtMermaid onto globalThis.
function loadVtm() {
  new Function(SRC)();
  return globalThis.vtMermaid;
}

const vtm = loadVtm();

function makeDoc(mermaidCount = 0) {
  const nodes = Array.from({ length: mermaidCount }, () => ({
    tagName: "div",
  }));
  const scripts = [];
  return {
    querySelectorAll(sel) {
      return sel === ".vt-mermaid" ? nodes : [];
    },
    createElement() {
      return { src: "", onload: null };
    },
    head: {
      appendChild(el) {
        scripts.push(el);
      },
    },
    documentElement: { dataset: {} },
    _scripts: scripts,
  };
}

describe("vtMermaid.init", () => {
  it("no-ops when no .vt-mermaid elements present", () => {
    const doc = makeDoc(0);
    vtm.init(doc, { cdn: "https://fake/mermaid.js" });
    expect(doc._scripts).toHaveLength(0);
  });

  it("appends mermaid script when .vt-mermaid elements exist", () => {
    const doc = makeDoc(2);
    vtm.init(doc, { cdn: "https://fake/mermaid.js" });
    expect(doc._scripts).toHaveLength(1);
    expect(doc._scripts[0].src).toBe("https://fake/mermaid.js");
  });

  it("falls back to the CDN when no script location is derivable", () => {
    const doc = makeDoc(1);
    vtm.init(doc);
    expect(doc._scripts[0].src).toMatch(/cdn\.jsdelivr\.net/);
  });

  it("prefers the vendored sibling derived from the script location", () => {
    const doc = makeDoc(1);
    vtm.init(doc, { self: "https://x/assets/mermaid.js" });
    expect(doc._scripts[0].src).toBe("https://x/assets/mermaid.min.js");
  });

  it("falls back to the CDN when the local script fails to load", () => {
    const doc = makeDoc(1);
    vtm.init(doc, { self: "../assets/mermaid.js" });
    expect(doc._scripts[0].src).toBe("../assets/mermaid.min.js");
    doc._scripts[0].onerror();
    expect(doc._scripts).toHaveLength(2);
    expect(doc._scripts[1].src).toMatch(/cdn\.jsdelivr\.net/);
  });
});

describe("vtMermaid.isDark", () => {
  it('returns true when data-theme is "dark"', () => {
    expect(vtm.isDark({ dataset: { theme: "dark" } })).toBe(true);
  });

  it('returns false when data-theme is "light"', () => {
    expect(vtm.isDark({ dataset: { theme: "light" } })).toBe(false);
  });

  it("falls back to matchMedia and returns true when dark", () => {
    const mm = () => ({ matches: true });
    expect(vtm.isDark({ dataset: {} }, mm)).toBe(true);
  });

  it("falls back to matchMedia and returns false when light", () => {
    const mm = () => ({ matches: false });
    expect(vtm.isDark({ dataset: {} }, mm)).toBe(false);
  });

  it("returns false when no dataset and no matchMedia", () => {
    expect(vtm.isDark({ dataset: {} }, null)).toBe(false);
  });
});
