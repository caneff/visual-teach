/* visual-teach — math component.
   Renders .vt-math display blocks and inline \(...\) / \[...\] delimiters
   via KaTeX. Silently skips when katex global is absent. */

/* KaTeX math rendering: processes .vt-math display blocks and inline math
   delimiters (\(...\) and \[...\]) in the document body.
   Silently skips when katex global is absent (no network, no KaTeX loaded). */
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
  var _doInitKatex = function () {
    initKatex();
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", _doInitKatex);
  } else {
    _doInitKatex();
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { initKatex: initKatex };
} else if (typeof window !== "undefined") {
  window.vtMath = { initKatex: initKatex };
}
