/* bayes-calc — live posterior calculator.
   Markup (the lesson supplies values via the `value` attributes):

   <div class="vt-bayescalc" data-pop="10000" data-noun="people"
        data-cond="have the condition" data-test="screening test">
     <div class="bc-controls">
       <label><span class="bc-name">Base rate</span>
         <span class="bc-inwrap">
           <input class="bc-prev" type="number" value="0.1" min="0" max="100" step="any">
           <span class="bc-unit">% have it</span>
         </span>
       </label>
       <label><span class="bc-name">Sensitivity</span>
         <span class="bc-inwrap">
           <input class="bc-sens" type="number" value="99" min="0" max="100" step="any">
           <span class="bc-unit">% true positive</span>
         </span>
       </label>
       <label><span class="bc-name">Specificity</span>
         <span class="bc-inwrap">
           <input class="bc-spec" type="number" value="99" min="0" max="100" step="any">
           <span class="bc-unit">% true negative</span>
         </span>
       </label>
     </div>
     <div class="bc-out" aria-live="polite"></div>
   </div>

   Everything else (the natural-frequency story, the bar, the posterior) is
   generated here. Self-contained vanilla JS; no library dependency. */

(function () {
  function fmtCount(n) {
    // Whole-ish counts read best rounded; keep one decimal only when it matters.
    var r = Math.round(n);
    if (Math.abs(n - r) < 0.05) return r.toLocaleString();
    return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
  }

  function fmtPct(x) {
    if (x >= 0.0995) return (x * 100).toFixed(0) + "%";
    return (x * 100).toFixed(1) + "%";
  }

  function wire(block) {
    var pop = parseFloat(block.dataset.pop) || 10000;
    var noun = block.dataset.noun || "people";
    var cond = block.dataset.cond || "have the condition";
    var test = block.dataset.test || "test";
    var prev = block.querySelector(".bc-prev");
    var sens = block.querySelector(".bc-sens");
    var spec = block.querySelector(".bc-spec");
    var out = block.querySelector(".bc-out");
    if (!prev || !sens || !spec || !out) {
      console.warn("visual-teach: vt-bayescalc missing inputs/output — inert");
      return;
    }

    function readPct(el) {
      var v = parseFloat(el.value);
      if (isNaN(v) || v < 0 || v > 100) return null;
      return v / 100;
    }

    function update() {
      var p = readPct(prev);
      var se = readPct(sens);
      var sp = readPct(spec);
      if (p === null || se === null || sp === null) {
        out.innerHTML =
          '<p class="bc-error">Enter each value as a percentage between 0 and 100.</p>';
        return;
      }

      var sick = pop * p;
      var healthy = pop - sick;
      var tp = sick * se; // truly sick AND test positive
      var fp = healthy * (1 - sp); // healthy BUT test positive (false alarm)
      var pos = tp + fp;
      var post = pos > 0 ? tp / pos : 0;
      var tpShare = pos > 0 ? (tp / pos) * 100 : 0;
      var fpShare = 100 - tpShare;

      out.innerHTML =
        '<p class="bc-story">Out of <b>' +
        fmtCount(pop) +
        "</b> " +
        noun +
        ", <b>" +
        fmtCount(sick) +
        "</b> " +
        cond +
        ". A positive " +
        test +
        " flags <b class=\"bc-tp\">" +
        fmtCount(tp) +
        "</b> of them correctly — but it also flags <b class=\"bc-fp\">" +
        fmtCount(fp) +
        "</b> of the <b>" +
        fmtCount(healthy) +
        "</b> who are fine. So <b>" +
        fmtCount(pos) +
        "</b> " +
        noun +
        " test positive, and only <b class=\"bc-tp\">" +
        fmtCount(tp) +
        "</b> of those actually " +
        cond +
        ".</p>" +
        '<div class="bc-headline"><span class="bc-post">' +
        fmtPct(post) +
        '</span><span class="bc-post-lbl">chance you actually ' +
        cond +
        ", given a positive result</span></div>" +
        '<div class="bc-bar"><div class="seg-tp" style="width:' +
        tpShare +
        '%"></div><div class="seg-fp" style="width:' +
        fpShare +
        '%"></div></div>' +
        '<div class="bc-legend">' +
        '<span class="key"><span class="sw sw-tp"></span>Real positives — ' +
        fmtCount(tp) +
        "</span>" +
        '<span class="key"><span class="sw sw-fp"></span>False alarms — ' +
        fmtCount(fp) +
        "</span></div>";
    }

    [prev, sens, spec].forEach(function (el) {
      el.addEventListener("input", update);
    });
    update();
  }

  function init() {
    document.querySelectorAll(".vt-bayescalc").forEach(wire);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
