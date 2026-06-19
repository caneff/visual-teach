/* visual-teach — opt-in mermaid bridge.
   Lazy-loads mermaid CDN only when .vt-mermaid elements are present.
   Include this file in lessons that use computed graphs (sequence, state, ER);
   prefer the hand-composed CSS diagram vocabulary for everything else.

   Browser auto-init fires on DOMContentLoaded (or immediately if already loaded).
   In CommonJS/Node (tests) the factory is exported directly without auto-init.

   Usage:
     <div class="vt-mermaid">
       sequenceDiagram
         A->>B: Hello
     </div>
     <script src="../assets/mermaid.js"></script>
*/
;(function (root, factory) {
  'use strict';
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.vtMermaid = factory();
    if (typeof document !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { root.vtMermaid.init(); });
      } else {
        root.vtMermaid.init();
      }
    }
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var CDN = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js';

  // Map vt-* CSS custom properties to mermaid themeVariables.
  // Includes sequence/state-specific vars so diagrams stay readable in dark
  // mode — the generic core vars alone leave actor boxes, signals, and notes
  // on mermaid's light-theme defaults.
  function readTokens(docEl, gcs) {
    gcs = gcs || (typeof window !== 'undefined' ? window.getComputedStyle.bind(window) : null);
    var s = gcs ? gcs(docEl) : { getPropertyValue: function () { return ''; } };
    function get(v, fallback) { return s.getPropertyValue(v).trim() || fallback; }

    var ink    = get('--vt-ink', '#1a1f2b');
    var muted  = get('--vt-muted', '#5b6472');
    var accent = get('--vt-accent', '#1a73e8');
    var accFg  = get('--vt-accent-fg', '#ffffff');
    var rule   = get('--vt-rule', '#e3e6ea');
    var paper  = get('--vt-paper', '#ffffff');
    var soft   = get('--vt-soft', paper);
    var noteBg = get('--vt-warn-soft', paper);

    return {
      // core
      primaryColor: accent, primaryTextColor: accFg, primaryBorderColor: rule,
      lineColor: muted, textColor: ink, background: paper, mainBkg: paper,
      edgeLabelBackground: soft, nodeBorder: rule,
      // sequence: actors, signals, labels, notes, activations
      actorBkg: soft, actorBorder: rule, actorTextColor: ink, actorLineColor: muted,
      signalColor: muted, signalTextColor: ink,
      labelBoxBkgColor: soft, labelBoxBorderColor: rule, labelTextColor: ink,
      loopTextColor: ink,
      noteBkgColor: noteBg, noteTextColor: ink, noteBorderColor: rule,
      activationBkgColor: soft, activationBorderColor: rule,
      sequenceNumberColor: accFg,
    };
  }

  // Detect dark mode from [data-theme] attribute, falling back to matchMedia.
  function isDark(docEl, mm) {
    var t = docEl.dataset && docEl.dataset.theme;
    if (t === 'dark') return true;
    if (t === 'light') return false;
    var mq = mm || (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia.bind(window) : null);
    return !!(mq && mq('(prefers-color-scheme: dark)').matches);
  }

  // No-ops when no .vt-mermaid elements are found — zero CDN cost for lessons
  // that don't use computed graphs.
  function init(doc, options) {
    doc = doc || (typeof document !== 'undefined' ? document : null);
    if (!doc) return;
    var nodes = doc.querySelectorAll('.vt-mermaid');
    if (!nodes.length) return;

    options = options || {};
    var src = options.cdn || CDN;

    var dark = isDark(doc.documentElement, options.matchMedia);

    var script = doc.createElement('script');
    script.src = src;
    script.onload = function () {
      // Dark mode: use mermaid's native 'dark' theme — a coherent, tested
      // palette that's readable across every diagram type. Light mode: brand it
      // via 'base' + our vt-* tokens. Hand-mapping dark themeVariables proved
      // fragile (sequence-only coverage, and pinning derived colors broke base).
      window.mermaid.initialize(dark
        ? { startOnLoad: false, theme: 'dark' }
        : { startOnLoad: false, theme: 'base',
            themeVariables: readTokens(doc.documentElement, options.getComputedStyle) });
      window.mermaid.run({ nodes: Array.from(nodes) });
    };
    doc.head.appendChild(script);
  }

  return { init: init, readTokens: readTokens, isDark: isDark };
});
