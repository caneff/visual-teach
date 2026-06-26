/* piano — render an interactive keyboard and expose a small API per instance.

   Markup the lesson writes:
     <div class="vt-piano" data-start="C4" data-keys="13" data-labels="white"></div>

   data-start  starting note as <letter><octave>, e.g. "C4" (default "C4")
   data-keys   how many semitone keys to render, left→right (default 13)
   data-labels "white" | "all" | "c" | "none"  which keys show a name (default "white")
   data-readout "off" to suppress the spoken-name line under the keyboard

   After init, each block carries `el.vtPiano`, an object with:
     keys           array of key elements, left→right
     at(i)          key element by 0-based index
     find(abs)      key element whose absolute semitone === abs (or null)
     setState(i, c) add highlight class c ('is-root' | 'is-target' | 'is-on' |
                    'is-good' | 'is-bad' | 'is-sel') to key i
     clear(c)       remove class c from every key (omit c to clear all states)
     badge(i, t)    drop a small number badge t onto key i ('' removes it)
     say(html)      write to the readout line under the keyboard
   The block also emits a 'vt-key' CustomEvent on every click, with detail:
     { index, pc, name, octave, abs, white, el }
   Keys carry data-* too: data-index data-pc data-abs data-name data-octave. */

(function () {
  var NAMES = [
    "C",
    "C♯",
    "D",
    "D♯",
    "E",
    "F",
    "F♯",
    "G",
    "G♯",
    "A",
    "A♯",
    "B",
  ];
  var BLACK = { 1: 1, 3: 1, 6: 1, 8: 1, 10: 1 };
  var STATE_CLASSES = [
    "is-root",
    "is-target",
    "is-on",
    "is-good",
    "is-bad",
    "is-sel",
  ];

  function parseStart(s) {
    var m = /^([A-Ga-g])([#♯ b♭]*)(-?\d+)$/.exec((s || "C4").trim());
    if (!m) return { pc: 0, octave: 4 };
    var letterPc = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[
      m[1].toUpperCase()
    ];
    var acc = m[2] || "";
    if (acc.indexOf("#") > -1 || acc.indexOf("♯") > -1) letterPc += 1;
    if (acc.indexOf("b") > -1 || acc.indexOf("♭") > -1) letterPc -= 1;
    return { pc: ((letterPc % 12) + 12) % 12, octave: parseInt(m[3], 10) };
  }

  function wirePiano(block) {
    if (block.vtPiano) return; // idempotent

    var start = parseStart(block.dataset.start);
    var count = Math.max(1, parseInt(block.dataset.keys || "13", 10));
    var labelMode = block.dataset.labels || "white";

    var pwVar = getComputedStyle(block).getPropertyValue("--vt-pw");
    var pw = parseFloat(pwVar) || 42;
    var bwVar = getComputedStyle(block).getPropertyValue("--vt-bw");
    var bw = parseFloat(bwVar) || 28;
    var phVar = getComputedStyle(block).getPropertyValue("--vt-ph");
    var ph = parseFloat(phVar) || 168;

    var stage = document.createElement("div");
    stage.className = "vt-piano-keys";

    var startAbs = start.octave * 12 + start.pc;
    var keys = [];
    var whiteCount = 0;

    // first pass: how many white keys (for stage width)
    for (var i = 0; i < count; i++) {
      if (!BLACK[(startAbs + i) % 12]) whiteCount++;
    }

    var w = 0; // running white-key index
    for (var k = 0; k < count; k++) {
      var abs = startAbs + k;
      var pc = ((abs % 12) + 12) % 12;
      var octave = Math.floor(abs / 12);
      var isBlack = !!BLACK[pc];
      var name = NAMES[pc];

      var key = document.createElement("button");
      key.type = "button";
      key.className = "vt-pkey " + (isBlack ? "black" : "white");
      key.dataset.index = String(k);
      key.dataset.pc = String(pc);
      key.dataset.abs = String(abs);
      key.dataset.name = name;
      key.dataset.octave = String(octave);
      key.setAttribute("aria-label", name + octave);

      if (isBlack) {
        // sits on the boundary before the current (upcoming) white key
        key.style.left = w * pw - bw / 2 + "px";
      } else {
        key.style.left = w * pw + "px";
        w++;
      }

      var showLabel =
        labelMode === "all" ||
        (labelMode === "white" && !isBlack) ||
        (labelMode === "c" && pc === 0);
      if (showLabel) {
        var lbl = document.createElement("span");
        lbl.className = "lbl";
        lbl.textContent = labelMode === "c" ? name + octave : name;
        key.appendChild(lbl);
      }

      stage.appendChild(key);
      keys.push(key);
    }

    stage.style.width = whiteCount * pw + "px";
    stage.style.height = ph + "px";

    block.textContent = "";
    block.appendChild(stage);

    var readout = null;
    if (block.dataset.readout !== "off") {
      readout = document.createElement("div");
      readout.className = "vt-piano-readout";
      readout.setAttribute("aria-live", "polite");
      readout.innerHTML = "&nbsp;";
      block.appendChild(readout);
    }

    var api = {
      el: block,
      keys: keys,
      at: function (i) {
        return keys[i] || null;
      },
      find: function (abs) {
        for (var j = 0; j < keys.length; j++)
          if (+keys[j].dataset.abs === abs) return keys[j];
        return null;
      },
      setState: function (i, cls) {
        var key = typeof i === "number" ? keys[i] : i;
        if (key) key.classList.add(cls);
        return key;
      },
      clear: function (cls) {
        keys.forEach(function (key) {
          if (cls) key.classList.remove(cls);
          else
            STATE_CLASSES.forEach(function (c) {
              key.classList.remove(c);
            });
        });
      },
      badge: function (i, text) {
        var key = typeof i === "number" ? keys[i] : i;
        if (!key) return;
        var b = key.querySelector(".step");
        if (text === "" || text == null) {
          if (b) b.remove();
          return;
        }
        if (!b) {
          b = document.createElement("span");
          b.className = "step";
          key.appendChild(b);
        }
        b.textContent = text;
      },
      say: function (html) {
        if (readout) readout.innerHTML = html;
      },
    };

    keys.forEach(function (key) {
      key.addEventListener("click", function () {
        key.classList.add("is-press");
        setTimeout(function () {
          key.classList.remove("is-press");
        }, 130);
        var detail = {
          index: +key.dataset.index,
          pc: +key.dataset.pc,
          name: key.dataset.name,
          octave: +key.dataset.octave,
          abs: +key.dataset.abs,
          white: key.classList.contains("white"),
          el: key,
        };
        block.dispatchEvent(
          new CustomEvent("vt-key", { detail: detail, bubbles: true })
        );
      });
    });

    block.vtPiano = api;
  }

  function wireAll() {
    document.querySelectorAll(".vt-piano").forEach(function (el) {
      try {
        wirePiano(el);
      } catch (e) {
        console.warn("visual-teach piano: failed to wire", e);
      }
    });
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", wireAll);
    } else {
      wireAll();
    }
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { wirePiano: wirePiano };
  } else if (typeof window !== "undefined") {
    window.vtPiano = { wirePiano: wirePiano };
  }
})();
