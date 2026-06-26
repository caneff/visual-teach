import { describe, it, expect, beforeEach, vi } from "vitest";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { wireSandbox } from "../assets/components/sandbox/sandbox.js";

const SANDBOX_SRC = readFileSync(
  resolve(
    dirname(fileURLToPath(import.meta.url)),
    "../assets/components/sandbox/sandbox.js"
  ),
  "utf8"
);
function autoWire() {
  new Function(SANDBOX_SRC)();
}

function makeSandbox(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  document.body.appendChild(div);
  return div.querySelector(".vt-sandbox");
}

function input(el, value) {
  el.value = value;
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

beforeEach(() => {
  document.body.innerHTML = "";
  delete window._vtSandboxEval;
  vi.useRealTimers();
});

// ── Missing required children ─────────────────────────────────────────────────

describe("sandbox — missing required children", () => {
  it("warns when input/textarea is missing", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const sb = makeSandbox(`
      <div class="vt-sandbox" data-fn="_vtSandboxEval">
        <div class="vt-sandbox-output" aria-live="polite"></div>
      </div>
    `);
    wireSandbox(sb);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("input"));
    warn.mockRestore();
  });

  it("warns when .vt-sandbox-output is missing", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const sb = makeSandbox(`
      <div class="vt-sandbox" data-fn="_vtSandboxEval">
        <input type="text" />
      </div>
    `);
    wireSandbox(sb);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(".vt-sandbox-output")
    );
    warn.mockRestore();
  });

  it("warns when data-fn attribute is missing", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const sb = makeSandbox(`
      <div class="vt-sandbox">
        <input type="text" />
        <div class="vt-sandbox-output" aria-live="polite"></div>
      </div>
    `);
    wireSandbox(sb);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("data-fn"));
    warn.mockRestore();
  });

  it("warns when the named function does not exist in window", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const sb = makeSandbox(`
      <div class="vt-sandbox" data-fn="nonExistentFn">
        <input type="text" />
        <div class="vt-sandbox-output" aria-live="polite"></div>
      </div>
    `);
    wireSandbox(sb);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("nonExistentFn"));
    warn.mockRestore();
  });

  it("includes the block class in warning messages", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const sb = makeSandbox(`<div class="vt-sandbox"></div>`);
    wireSandbox(sb);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("vt-sandbox"));
    warn.mockRestore();
  });

  it("does not throw when required children are missing", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const sb = makeSandbox(`<div class="vt-sandbox"></div>`);
    expect(() => wireSandbox(sb)).not.toThrow();
    warn.mockRestore();
  });
});

// ── Core input → output behavior ──────────────────────────────────────────────

describe("sandbox — input to output", () => {
  function buildSandbox() {
    window._vtSandboxEval = (val) => "result: " + val.toUpperCase();
    const sb = makeSandbox(`
      <div class="vt-sandbox" data-fn="_vtSandboxEval">
        <label for="sb-test">Enter text</label>
        <input id="sb-test" type="text" />
        <div class="vt-sandbox-output" aria-live="polite"></div>
      </div>
    `);
    wireSandbox(sb);
    return sb;
  }

  it("renders the fn return value into .vt-sandbox-output on input", () => {
    vi.useFakeTimers();
    const sb = buildSandbox();
    input(sb.querySelector("input"), "hello");
    vi.runAllTimers();
    expect(sb.querySelector(".vt-sandbox-output").textContent).toBe(
      "result: HELLO"
    );
  });

  it("calls the fn with the current input value", () => {
    vi.useFakeTimers();
    const fn = vi.fn(() => "out");
    window._vtSandboxEval = fn;
    const sb = makeSandbox(`
      <div class="vt-sandbox" data-fn="_vtSandboxEval">
        <input type="text" />
        <div class="vt-sandbox-output" aria-live="polite"></div>
      </div>
    `);
    wireSandbox(sb);
    input(sb.querySelector("input"), "abc");
    vi.runAllTimers();
    expect(fn).toHaveBeenCalledWith("abc");
  });

  it("debounces: fn is called once after rapid inputs", () => {
    vi.useFakeTimers();
    const fn = vi.fn(() => "ok");
    window._vtSandboxEval = fn;
    const sb = makeSandbox(`
      <div class="vt-sandbox" data-fn="_vtSandboxEval">
        <input type="text" />
        <div class="vt-sandbox-output" aria-live="polite"></div>
      </div>
    `);
    wireSandbox(sb);
    const inp = sb.querySelector("input");
    input(inp, "a");
    input(inp, "ab");
    input(inp, "abc");
    vi.runAllTimers();
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("abc");
  });

  it("works with a textarea element", () => {
    vi.useFakeTimers();
    window._vtSandboxEval = (val) => val.split("\n").length + " lines";
    const sb = makeSandbox(`
      <div class="vt-sandbox" data-fn="_vtSandboxEval">
        <label for="sb-ta">Code</label>
        <textarea id="sb-ta" rows="3"></textarea>
        <div class="vt-sandbox-output" aria-live="polite"></div>
      </div>
    `);
    wireSandbox(sb);
    input(sb.querySelector("textarea"), "line1\nline2\nline3");
    vi.runAllTimers();
    expect(sb.querySelector(".vt-sandbox-output").textContent).toBe("3 lines");
  });
});

// ── Error surfacing ───────────────────────────────────────────────────────────

describe("sandbox — error surfacing", () => {
  it("does not throw when the author fn throws", () => {
    vi.useFakeTimers();
    window._vtSandboxEval = () => {
      throw new Error("boom");
    };
    const sb = makeSandbox(`
      <div class="vt-sandbox" data-fn="_vtSandboxEval">
        <input type="text" />
        <div class="vt-sandbox-output" aria-live="polite"></div>
      </div>
    `);
    wireSandbox(sb);
    expect(() => {
      input(sb.querySelector("input"), "x");
      vi.runAllTimers();
    }).not.toThrow();
  });

  it("renders the error message into .vt-sandbox-error when fn throws", () => {
    vi.useFakeTimers();
    window._vtSandboxEval = () => {
      throw new Error("something went wrong");
    };
    const sb = makeSandbox(`
      <div class="vt-sandbox" data-fn="_vtSandboxEval">
        <input type="text" />
        <div class="vt-sandbox-output" aria-live="polite"></div>
      </div>
    `);
    wireSandbox(sb);
    input(sb.querySelector("input"), "x");
    vi.runAllTimers();
    const err = sb.querySelector(".vt-sandbox-error");
    expect(err).not.toBeNull();
    expect(err.textContent).toContain("something went wrong");
  });

  it("clears the error region on a successful subsequent input", () => {
    vi.useFakeTimers();
    let shouldThrow = true;
    window._vtSandboxEval = (val) => {
      if (shouldThrow) throw new Error("oops");
      return "ok: " + val;
    };
    const sb = makeSandbox(`
      <div class="vt-sandbox" data-fn="_vtSandboxEval">
        <input type="text" />
        <div class="vt-sandbox-output" aria-live="polite"></div>
      </div>
    `);
    wireSandbox(sb);
    input(sb.querySelector("input"), "bad");
    vi.runAllTimers();
    // now fix it
    shouldThrow = false;
    input(sb.querySelector("input"), "good");
    vi.runAllTimers();
    const err = sb.querySelector(".vt-sandbox-error");
    expect(err === null || err.textContent === "").toBe(true);
  });
});

// ── Auto-wire isolation ───────────────────────────────────────────────────────

describe("sandbox — auto-wire isolation", () => {
  it("a valid sandbox still wires when preceded by a malformed one", () => {
    window._vtSandboxEval = (val) => ">" + val;
    vi.spyOn(console, "warn").mockImplementation(() => {});
    document.body.innerHTML = `
      <div class="vt-sandbox">
        <!-- malformed: no data-fn, no output -->
      </div>
      <div class="vt-sandbox" data-fn="_vtSandboxEval">
        <input type="text" />
        <div class="vt-sandbox-output" aria-live="polite"></div>
      </div>
    `;
    expect(() => autoWire()).not.toThrow();
    vi.restoreAllMocks();
  });
});
