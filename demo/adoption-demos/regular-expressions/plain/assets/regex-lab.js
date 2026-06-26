/* ============================================================================
   regex-lab.js  —  shared interactive components for the Regex course.
   No dependencies. Everything is computed by the browser's own RegExp engine,
   so what the learner sees is exactly what a real (JS/PCRE-style) engine does.

   Components (auto-initialised on DOMContentLoaded):

   1. .strip   — read-only demo. Shows a pattern matched against a sample,
                 highlighting every match (and, optionally, capture groups).
       <div class="strip" data-pattern="\d+" data-flags="g"
            data-sample="Order 12 ships in 3 days" data-note="runs of digits"></div>

   2. .lab     — interactive. The learner types a pattern; matches highlight
                 live. With data-expect it becomes a pass/fail challenge.
       <div class="lab" data-sample="..." data-goal="Match each number"
            data-expect='["12","3"]'></div>

   3. .quiz    — multiple-choice recall, immediate feedback.
       <div class="quiz" data-answer="1" data-explain="...">
         <p class="q">...</p>
         <button class="opt">A</button> ... (buttons)
       </div>
   ============================================================================ */
(function () {
  "use strict";

  function esc(s) {
    return s.replace(/[&<>]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c];
    });
  }

  // Overlay capture-group ranges inside a single match.
  function buildGroups(text, m, start, end) {
    var ranges = [];
    if (m.indices) {
      for (var i = 1; i < m.indices.length; i++) {
        if (m.indices[i]) ranges.push([m.indices[i][0], m.indices[i][1]]);
      }
    }
    ranges.sort(function (a, b) { return a[0] - b[0]; });
    var clean = [], lastEnd = start;
    ranges.forEach(function (r) {
      if (r[0] >= lastEnd && r[1] > r[0]) { clean.push(r); lastEnd = r[1]; }
    });
    var html = "", cur = start;
    clean.forEach(function (r) {
      html += esc(text.slice(cur, r[0]));
      html += '<mark class="g">' + esc(text.slice(r[0], r[1])) + "</mark>";
      cur = r[1];
    });
    html += esc(text.slice(cur, end));
    return html;
  }

  // Returns {html, matches:[...]} or {error: "..."}
  function highlight(text, source, flags, showGroups) {
    var f = (flags || "").replace(/[^gimsuy]/g, "");
    if (f.indexOf("g") === -1) f += "g";
    if (showGroups && f.indexOf("d") === -1) f += "d";
    var re;
    try {
      re = new RegExp(source, f);
    } catch (e) {
      return { error: e.message };
    }
    var out = "", last = 0, matches = [], m, guard = 0;
    while ((m = re.exec(text)) !== null && guard++ < 10000) {
      var start = m.index, end = start + m[0].length;
      out += esc(text.slice(last, start));
      if (m[0].length === 0) {
        out += '<mark class="m" title="zero-width match">&#8203;|</mark>';
        re.lastIndex++;
        last = end;
        continue;
      }
      var inner = showGroups ? buildGroups(text, m, start, end)
                             : esc(text.slice(start, end));
      out += '<mark class="m">' + inner + "</mark>";
      matches.push(m[0]);
      last = end;
    }
    out += esc(text.slice(last));
    return { html: out, matches: matches };
  }

  /* ---- 1. Strips ---------------------------------------------------------*/
  function initStrip(el) {
    var pattern = el.getAttribute("data-pattern") || "";
    var flags   = el.getAttribute("data-flags") || "g";
    var sample  = el.getAttribute("data-sample") || "";
    var note    = el.getAttribute("data-note") || "";
    var groups  = el.hasAttribute("data-groups");

    var r = highlight(sample, pattern, flags, groups);
    var displayFlags = flags.replace(/[^gimsuy]/g, "");
    var head =
      '<div class="strip-head">' +
        '<span>pattern <span class="pat">/' + esc(pattern) + "/" +
          esc(displayFlags) + "</span></span>" +
        (note ? '<span class="note">' + esc(note) + "</span>" : "") +
      "</div>";
    var body = '<div class="strip-body">' +
      (r.error ? '<span style="color:#c0392b">⚠ ' + esc(r.error) + "</span>"
               : (r.html || "<em>no text</em>")) +
      "</div>";
    el.innerHTML = head + body;
  }

  /* ---- 2. Labs -----------------------------------------------------------*/
  function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }

  function initLab(el) {
    var sample = el.getAttribute("data-sample") || "";
    var flags  = el.getAttribute("data-flags") || "g";
    var goal   = el.getAttribute("data-goal") || "";
    var start  = el.getAttribute("data-pattern") || "";
    var groups = el.hasAttribute("data-groups");
    var expect = null;
    if (el.hasAttribute("data-expect")) {
      try { expect = JSON.parse(el.getAttribute("data-expect")); } catch (e) { expect = null; }
    }
    var displayFlags = flags.replace(/[^gimsuy]/g, "");

    el.innerHTML =
      (goal ? '<div class="lab-goal"><b>Goal:</b> ' + goal + "</div>" : "") +
      '<div class="lab-bar"><span class="slash">/</span>' +
        '<input type="text" spellcheck="false" autocapitalize="off" ' +
          'autocomplete="off" aria-label="regular expression" />' +
        '<span class="flags">/' + esc(displayFlags) + "</span></div>" +
      '<div class="lab-sample"></div>' +
      '<div class="lab-status idle"></div>';

    var input  = el.querySelector("input");
    var out    = el.querySelector(".lab-sample");
    var status = el.querySelector(".lab-status");
    input.value = start;

    function render() {
      var src = input.value;
      if (src === "") {
        out.innerHTML = esc(sample);
        status.className = "lab-status idle";
        status.textContent = expect
          ? "Type a pattern above to begin."
          : "Type a pattern to see what it matches.";
        return;
      }
      var r = highlight(sample, src, flags, groups);
      if (r.error) {
        out.innerHTML = esc(sample);
        status.className = "lab-status no";
        status.textContent = "✗ invalid regex — " + r.error;
        return;
      }
      out.innerHTML = r.html;
      if (expect) {
        if (arraysEqual(r.matches, expect)) {
          status.className = "lab-status ok";
          status.textContent = "✓ Correct — matched " + r.matches.length +
            " of " + expect.length + ". Nicely done.";
        } else {
          status.className = "lab-status no";
          status.textContent = "… matched [" +
            r.matches.map(function (s) { return '"' + s + '"'; }).join(", ") +
            "] — want " + expect.length + " specific piece" +
            (expect.length === 1 ? "" : "s") + ". Keep adjusting.";
        }
      } else {
        status.className = "lab-status idle";
        status.textContent = r.matches.length + " match" +
          (r.matches.length === 1 ? "" : "es") + ".";
      }
    }

    input.addEventListener("input", render);
    render();
  }

  /* ---- 3. Quizzes --------------------------------------------------------*/
  function initQuiz(el) {
    var answer  = parseInt(el.getAttribute("data-answer"), 10);
    var explain = el.getAttribute("data-explain") || "";
    var opts = Array.prototype.slice.call(el.querySelectorAll(".opt"));
    var fb = document.createElement("div");
    fb.className = "fb";
    el.appendChild(fb);
    var solved = false;

    opts.forEach(function (opt, i) {
      opt.addEventListener("click", function () {
        if (solved) return;
        if (i === answer) {
          opt.classList.add("correct");
          fb.className = "fb correct";
          fb.innerHTML = "✓ " + explain;
          solved = true;
        } else {
          opt.classList.add("wrong");
          opt.disabled = true;
          fb.className = "fb wrong";
          fb.textContent = "Not quite — try another.";
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".strip").forEach(initStrip);
    document.querySelectorAll(".lab").forEach(initLab);
    document.querySelectorAll(".quiz").forEach(initQuiz);
  });
})();
