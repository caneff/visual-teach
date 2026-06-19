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
  function readTokens(docEl, gcs) {
    gcs = gcs || (typeof window !== 'undefined' ? window.getComputedStyle.bind(window) : null);
    var s = gcs ? gcs(docEl) : { getPropertyValue: function () { return ''; } };
    function get(v) { return s.getPropertyValue(v).trim(); }
    return {
      primaryColor:       get('--vt-accent')     || '#1a73e8',
      primaryTextColor:   get('--vt-accent-fg')  || '#ffffff',
      primaryBorderColor: get('--vt-rule')        || '#e3e6ea',
      lineColor:          get('--vt-muted')       || '#5b6472',
      textColor:          get('--vt-ink')         || '#1a1f2b',
      background:         get('--vt-paper')       || '#ffffff',
      mainBkg:            get('--vt-paper')       || '#ffffff',
      edgeLabelBackground: get('--vt-paper')       || '#ffffff',
      nodeBorder:         get('--vt-rule')        || '#e3e6ea',
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

    var script = doc.createElement('script');
    script.src = src;
    script.onload = function () {
      window.mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        darkMode: isDark(doc.documentElement, options.matchMedia),
        themeVariables: readTokens(doc.documentElement, options.getComputedStyle),
      });
      window.mermaid.run({ nodes: Array.from(nodes) });
    };
    doc.head.appendChild(script);
  }

  return { init: init, readTokens: readTokens, isDark: isDark };
});
