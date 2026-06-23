/* base — shared lesson behaviour (theme bridge/toggle, anchors, a11y helpers).
   Extracted from visual-teach.js. Component behaviour (quiz, checklist, code
   block, Prism, KaTeX, diagrams) lives in its own file. */

function announce(liveRegion, text) {
  if (liveRegion) liveRegion.textContent = text;
}

function blockLabel(el) {
  return (
    Array.from(el.classList).find(function (c) {
      return c.startsWith("vt-");
    }) || el.className
  );
}

// Check that block contains every required child selector. Warns for each
// missing one and returns false if any are absent so the wirer can bail out.
function ensure(block, selectors) {
  var blockClass = blockLabel(block);
  var ok = true;
  selectors.forEach(function (sel) {
    if (!block.querySelector(sel)) {
      console.warn(
        "visual-teach: " +
          blockClass +
          " missing required " +
          sel +
          " — left inert"
      );
      ok = false;
    }
  });
  return ok;
}

// Feedback line: a verdict glyph (✔ / ✘) followed by the explanation HTML.
function verdict(ok, html) {
  return (
    '<span class="vt-fb-verdict">' +
    (ok ? "&#10004;" : "&#10008;") +
    "</span> " +
    html
  );
}

/* Theme bridge: let an embedding parent (e.g. an iframe-based before/after
   compare page) set the lesson theme via postMessage({vtTheme:'dark'|'light'}).
   Cross-origin-safe, so it works even when lessons are opened over file://,
   where the parent cannot reach contentDocument. */
function wireThemeBridge(win) {
  win.addEventListener("message", function (e) {
    var t = e.data && e.data.vtTheme;
    if (t === "dark" || t === "light")
      win.document.documentElement.dataset.theme = t;
  });
}

/* Standalone theme toggle: inject a fixed dark/light switch for a learner
   opening a lesson on its own. Skipped when (a) the page already has a
   .vt-theme-toggle (hand-built demos) or (b) the page is iframed — there the
   embedding parent owns the theme via postMessage (wireThemeBridge). */
function wireThemeToggle(win) {
  var doc = win.document;
  if (doc.querySelector(".vt-theme-toggle")) return;
  try {
    if (win.self !== win.top) return;
  } catch (e) {
    return;
  } // iframed → parent owns theme
  var stored = null;
  try {
    stored = win.localStorage.getItem("vtTheme");
  } catch (e) {}
  if (stored === "dark" || stored === "light")
    doc.documentElement.dataset.theme = stored;
  var btn = doc.createElement("button");
  btn.className = "vt-theme-toggle";
  btn.type = "button";
  btn.textContent = "◐ theme";
  btn.setAttribute("aria-label", "Toggle dark or light theme");
  btn.style.cssText =
    "position:fixed;top:1rem;right:1rem;z-index:99;font:inherit;font-size:.8rem;" +
    "padding:.35rem .7rem;border-radius:999px;cursor:pointer;border:1px solid var(--vt-rule);" +
    "background:var(--vt-soft);color:var(--vt-ink);";
  btn.addEventListener("click", function () {
    var dark =
      doc.documentElement.dataset.theme === "dark" ||
      (!doc.documentElement.dataset.theme &&
        win.matchMedia("(prefers-color-scheme: dark)").matches);
    var next = dark ? "light" : "dark";
    doc.documentElement.dataset.theme = next;
    try {
      win.localStorage.setItem("vtTheme", next);
    } catch (e) {}
  });
  doc.body.appendChild(btn);
}

function slugify(s) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/* Make every section heading linkable: slug -> id, inject a hover "#" anchor.
   Skips headings that already carry an anchor (hand-authored demos). */
function wireAnchors() {
  var seen = {};
  document.querySelectorAll("h2, h3").forEach(function (h) {
    if (h.querySelector(".vt-anchor")) return;
    var clone = h.cloneNode(true);
    clone
      .querySelectorAll(".vt-num, .sc-sub, .vt-anchor")
      .forEach(function (n) {
        n.remove();
      });
    var base = slugify(clone.textContent || "");
    if (!base) return;
    var slug = h.id || base,
      n = 1;
    while (!h.id && seen[slug]) {
      n++;
      slug = base + "-" + n;
    }
    seen[slug] = true;
    if (!h.id) h.id = slug;
    var a = document.createElement("a");
    a.className = "vt-anchor";
    a.href = "#" + h.id;
    a.setAttribute("aria-label", "Link to this section");
    a.textContent = "#";
    h.appendChild(a);
  });
}

function init() {
  wireAnchors();
  if (typeof window !== "undefined") {
    wireThemeBridge(window);
    wireThemeToggle(window);
  }
}

// UMD: expose the public API for tests (CommonJS) and as a browser global.
// Plain-script export (no ESM `export`) lets lessons load this with a classic
// <script src> that works from file:// — no module CORS, no local server.
var vtBase = {
  announce: announce,
  ensure: ensure,
  verdict: verdict,
  wireThemeBridge: wireThemeBridge,
  wireThemeToggle: wireThemeToggle,
  wireAnchors: wireAnchors,
  init: init,
};
if (typeof module !== "undefined" && module.exports) {
  module.exports = vtBase;
} else if (typeof window !== "undefined") {
  window.vtBase = vtBase;
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}
