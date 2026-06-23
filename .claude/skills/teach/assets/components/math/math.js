/* visual-teach — math component.
   Renders .vt-math display blocks and inline \(...\) / \[...\] delimiters
   via KaTeX. Silently skips when katex global is absent. */

function initKatex() {
  if (typeof katex === "undefined") return;

  document.querySelectorAll(".vt-math").forEach(function (el) {
    var tex = el.textContent.trim();
    try {
      el.innerHTML = katex.renderToString(tex, {
        displayMode: true,
        throwOnError: false,
      });
    } catch (e) {
      // leave raw text intact on parse error
    }
  });

  if (typeof renderMathInElement === "function") {
    try {
      renderMathInElement(document.body, {
        delimiters: [
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true },
        ],
        throwOnError: false,
      });
    } catch (e) {
      // leave inline math as-is on failure
    }
  }
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initKatex);
  } else {
    initKatex();
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { initKatex: initKatex };
} else if (typeof window !== "undefined") {
  window.vtMath = { initKatex: initKatex };
}
