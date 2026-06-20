// Tests for .vt-math KaTeX rendering block.
import { describe, it, expect, beforeEach, vi } from "vitest";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const JS_SRC = readFileSync(
  resolve(__dirname, "../assets/visual-teach.js"),
  "utf8"
);

function setup(html) {
  document.body.innerHTML = html;
  new Function(JS_SRC.replace(/^export\s+/gm, ""))();
}

beforeEach(() => {
  vi.restoreAllMocks();
  delete globalThis.katex;
  delete globalThis.renderMathInElement;
});

describe("initKatex — no KaTeX loaded", () => {
  it("no-ops silently when katex is not defined", () => {
    expect(() => {
      setup('<div class="vt-math">\\gamma</div>');
    }).not.toThrow();
  });

  it("leaves raw text intact when KaTeX is absent", () => {
    setup('<div class="vt-math">\\gamma</div>');
    expect(document.querySelector(".vt-math").textContent).toBe("\\gamma");
  });
});

describe("initKatex — renders .vt-math blocks", () => {
  beforeEach(() => {
    globalThis.katex = {
      renderToString: vi.fn(function (tex) {
        return '<span class="katex-rendered">' + tex + "</span>";
      }),
    };
  });

  it("calls katex.renderToString for each .vt-math element", () => {
    setup(`
      <div class="vt-math">\\gamma</div>
      <div class="vt-math">E = mc^2</div>
    `);
    expect(globalThis.katex.renderToString).toHaveBeenCalledTimes(2);
  });

  it("passes displayMode:true and throwOnError:false", () => {
    setup('<div class="vt-math">\\alpha</div>');
    const [, opts] = globalThis.katex.renderToString.mock.calls[0];
    expect(opts.displayMode).toBe(true);
    expect(opts.throwOnError).toBe(false);
  });

  it("replaces .vt-math innerHTML with rendered output", () => {
    setup('<div class="vt-math">\\beta</div>');
    expect(document.querySelector(".vt-math").innerHTML).toContain(
      "katex-rendered"
    );
  });

  it("does not call renderMathInElement when it is not defined", () => {
    // renderMathInElement is deleted in beforeEach; no error should occur
    expect(() => {
      setup('<div class="vt-math">\\pi</div>');
    }).not.toThrow();
  });
});

describe("initKatex — inline math via renderMathInElement", () => {
  beforeEach(() => {
    globalThis.katex = {
      renderToString: vi.fn(() => '<span class="katex-rendered"></span>'),
    };
    globalThis.renderMathInElement = vi.fn();
  });

  it("calls renderMathInElement on document.body", () => {
    setup("<p>Some inline math \\(x^2\\) here</p>");
    expect(globalThis.renderMathInElement).toHaveBeenCalledWith(
      document.body,
      expect.objectContaining({ throwOnError: false })
    );
  });

  it("passes both \\( and \\[ delimiters", () => {
    setup("<p>Inline \\(x\\) and block \\[y\\]</p>");
    const [, opts] = globalThis.renderMathInElement.mock.calls[0];
    const lefts = opts.delimiters.map((d) => d.left);
    expect(lefts).toContain("\\(");
    expect(lefts).toContain("\\[");
  });
});

describe("initKatex — error resilience", () => {
  it("leaves raw text when katex.renderToString throws", () => {
    globalThis.katex = {
      renderToString: vi.fn(() => {
        throw new Error("KaTeX parse error");
      }),
    };
    setup('<div class="vt-math">\\broken{</div>');
    expect(document.querySelector(".vt-math").textContent).toBe("\\broken{");
  });
});
