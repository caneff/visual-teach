/* regex-lab — wires every .rx-lab on the page.
 *
 * Markup contract:
 *   <div class="rx-lab" data-flags="i" data-initial="\\d+"
 *        data-want='["404","500"]'            (optional: challenge on full matches)
 *        data-want-captures='[["2024","ERROR"]]'  (optional: challenge on captures)
 *        data-want-flags="g">                  (optional: flags the solution needs)
 *     <p class="rx-title">…optional heading…</p>
 *     <div class="rx-samples">
 *       <pre class="rx-sample">sample text here</pre>
 *     </div>
 *   </div>
 *
 * The component injects the pattern input, info panel, error line, and (in
 * challenge mode) a verdict banner. Highlighting always uses global semantics
 * so every match is visible; zero-width matches (anchors) render as a caret.
 */
(function () {
  "use strict";

  function esc(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // Build the effective flags: always global (highlight all) + indices if
  // available (colour captures precisely). Preserve author flags i/m/s/u.
  function effectiveFlags(authorFlags) {
    var set = {};
    (authorFlags || "").split("").forEach(function (f) {
      if ("imsu".indexOf(f) !== -1) set[f] = true;
    });
    set.g = true;
    var flags = Object.keys(set).join("");
    // Try to add 'd' (hasIndices) for capture colouring; fall back if unsupported.
    try {
      new RegExp("a", flags + "d");
      return flags + "d";
    } catch (e) {
      return flags;
    }
  }

  // Render one match's text, painting capture groups when indices are present.
  function renderMatch(sample, m) {
    var start = m.index;
    var full = m[0];
    var end = start + full.length;
    if (!m.indices || m.indices.length <= 1) return esc(full);

    var ranges = [];
    for (var k = 1; k < m.indices.length; k++) {
      var r = m.indices[k];
      if (r && r[1] > r[0]) ranges.push({ s: r[0], e: r[1], k: k });
    }
    ranges.sort(function (a, b) {
      return a.s - b.s;
    });

    var html = "";
    var cursor = start;
    for (var i = 0; i < ranges.length; i++) {
      var g = ranges[i];
      if (g.s < cursor) continue; // skip overlapping/nested groups
      html += esc(sample.slice(cursor, g.s));
      var cls = "rx-cap rx-cap-" + (((g.k - 1) % 5) + 1);
      html += '<span class="' + cls + '">' + esc(sample.slice(g.s, g.e)) + "</span>";
      cursor = g.e;
    }
    html += esc(sample.slice(cursor, end));
    return html;
  }

  // Returns { html, matches:[{full,captures,index}] } for one sample.
  function highlight(sample, re) {
    re.lastIndex = 0;
    var out = "";
    var last = 0;
    var matches = [];
    var m;
    var guard = 0;
    while ((m = re.exec(sample)) !== null) {
      if (guard++ > 5000) break;
      var idx = m.index;
      out += esc(sample.slice(last, idx));
      if (m[0].length === 0) {
        out += '<span class="rx-caret" aria-label="zero-width match"></span>';
        last = idx;
        re.lastIndex = idx + 1; // step past a zero-width match
      } else {
        out += '<mark class="rx-hit">' + renderMatch(sample, m) + "</mark>";
        last = idx + m[0].length;
      }
      matches.push({
        full: m[0],
        index: m.index,
        captures: Array.prototype.slice.call(m, 1),
      });
    }
    out += esc(sample.slice(last));
    return { html: out, matches: matches };
  }

  function arraysEqual(a, b) {
    if (!a || !b || a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) {
      if (Array.isArray(a[i]) || Array.isArray(b[i])) {
        if (!arraysEqual(a[i], b[i])) return false;
      } else if (String(a[i]) !== String(b[i])) {
        return false;
      }
    }
    return true;
  }

  function parseJSON(str, fallback) {
    if (!str) return fallback;
    try {
      return JSON.parse(str);
    } catch (e) {
      return fallback;
    }
  }

  function wire(lab) {
    var samplesWrap = lab.querySelector(".rx-samples");
    if (!samplesWrap) {
      console.warn("regex-lab: missing .rx-samples — left inert", lab);
      return;
    }
    var sampleEls = Array.prototype.slice.call(
      samplesWrap.querySelectorAll(".rx-sample")
    );
    if (!sampleEls.length) {
      console.warn("regex-lab: no .rx-sample elements — left inert", lab);
      return;
    }
    // Snapshot original text once (re-render replaces innerHTML).
    var originals = sampleEls.map(function (el) {
      return el.textContent;
    });

    var authorFlags = lab.dataset.flags || "";
    var wantFull = parseJSON(lab.dataset.want, null);
    var wantCaptures = parseJSON(lab.dataset.wantCaptures, null);
    var isChallenge = wantFull !== null || wantCaptures !== null;

    // Build the pattern input line.
    var line = document.createElement("div");
    line.className = "rx-inputline";
    var flagLabel = authorFlags ? "/" + authorFlags : "/";
    line.innerHTML =
      '<span class="rx-delim left">/</span>' +
      '<input class="rx-pattern" type="text" spellcheck="false" ' +
      'autocomplete="off" autocapitalize="off" aria-label="Regular expression pattern">' +
      '<span class="rx-delim right">' + esc(flagLabel) + "</span>";
    samplesWrap.parentNode.insertBefore(line, samplesWrap);

    var input = line.querySelector(".rx-pattern");
    input.value = lab.dataset.initial || "";

    var error = document.createElement("div");
    error.className = "rx-error";
    error.setAttribute("aria-live", "polite");

    var info = document.createElement("div");
    info.className = "rx-info";
    info.setAttribute("aria-live", "polite");

    var verdict = null;
    if (isChallenge) {
      verdict = document.createElement("div");
      verdict.className = "rx-verdict";
      verdict.setAttribute("data-state", "idle");
      verdict.setAttribute("aria-live", "polite");
      verdict.textContent = "Write a pattern above to attempt the challenge.";
    }

    // Place panels after the samples.
    lab.appendChild(error);
    lab.appendChild(info);
    if (verdict) lab.appendChild(verdict);

    function clearHighlight() {
      sampleEls.forEach(function (el, i) {
        el.textContent = originals[i];
      });
    }

    function render() {
      var pattern = input.value;
      if (!pattern) {
        clearHighlight();
        error.textContent = "";
        info.textContent = "";
        if (verdict) {
          verdict.setAttribute("data-state", "idle");
          verdict.textContent =
            "Write a pattern above to attempt the challenge.";
        }
        return;
      }

      var re;
      try {
        re = new RegExp(pattern, effectiveFlags(authorFlags));
      } catch (e) {
        error.textContent = "✗ " + (e.message || String(e));
        clearHighlight();
        info.textContent = "";
        if (verdict) {
          verdict.setAttribute("data-state", "working");
          verdict.textContent = "Pattern isn't valid yet — keep going.";
        }
        return;
      }
      error.textContent = "";

      var total = 0;
      var anyGroups = false;
      var allFull = [];
      var allCaptures = [];
      sampleEls.forEach(function (el, i) {
        var res = highlight(originals[i], re);
        el.innerHTML = res.html;
        total += res.matches.length;
        res.matches.forEach(function (mm) {
          allFull.push(mm.full);
          if (mm.captures.length) {
            anyGroups = true;
            allCaptures.push(
              mm.captures.map(function (c) {
                return c == null ? "" : c;
              })
            );
          }
        });
      });

      // Info line.
      var bits = [total + (total === 1 ? " match" : " matches")];
      if (anyGroups) {
        var legend = '<span class="rx-legend">';
        var nGroups = allCaptures.length ? allCaptures[0].length : 0;
        for (var g = 1; g <= Math.min(nGroups, 5); g++) {
          legend +=
            '<span><span class="swatch g' + g + '"></span>group ' + g + "</span>";
        }
        legend += "</span>";
        info.innerHTML = esc(bits.join("  ·  ")) + legend;
      } else {
        info.textContent = bits.join("  ·  ");
      }

      // Challenge verdict.
      if (verdict) {
        var solved, want, gotLabel, wantLabel;
        if (wantCaptures !== null) {
          want = wantCaptures;
          solved = arraysEqual(allCaptures, want);
          gotLabel = JSON.stringify(allCaptures);
          wantLabel = JSON.stringify(want);
        } else {
          want = wantFull;
          solved = arraysEqual(allFull, want);
          gotLabel = JSON.stringify(allFull);
          wantLabel = JSON.stringify(want);
        }
        if (solved) {
          verdict.setAttribute("data-state", "solved");
          verdict.innerHTML =
            "✓ Solved — your pattern captures exactly the target." +
            '<span class="detail">' + esc(wantLabel) + "</span>";
        } else {
          verdict.setAttribute("data-state", "working");
          verdict.innerHTML =
            "Not yet — keep adjusting." +
            '<span class="detail">you have ' + esc(gotLabel) +
            "  ·  target " + esc(wantLabel) + "</span>";
        }
      }
    }

    var t = null;
    input.addEventListener("input", function () {
      clearTimeout(t);
      t = setTimeout(render, 180);
    });
    render();
  }

  function init() {
    document.querySelectorAll(".rx-lab").forEach(function (lab) {
      try {
        wire(lab);
      } catch (e) {
        console.warn("regex-lab: failed to wire", e);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
