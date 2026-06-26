/* ============================================================================
   keyboard.js — reusable interactive piano keyboard + music helpers
   Shared component for the "Intervals & the Major Scale" course.

   Everything is built on ONE idea the course teaches: a note is just an integer
   number of semitones. We use MIDI numbers (C4 = 60). White/black keys, names,
   intervals, and scales are all derived from that integer.

   Public API (attached to window.Music):
     Music.NAMES_SHARP, Music.NAMES_FLAT
     Music.midi(name)            -> 60         ("C4", "F#3", "Bb4")
     Music.name(midi, {flat})    -> "C4"
     Music.pc(midi)              -> 0..11       (pitch class)
     Music.isWhite(midi) / isBlack(midi)
     Music.INTERVALS             -> [{semitones,name,abbr}, ...]
     Music.intervalName(semis)   -> "perfect fifth"
     Music.MAJOR_STEPS           -> [2,2,1,2,2,2,1]
     Music.majorScale(rootName, {flat}) -> ["C4","D4",...,"C5"]
     Music.Keyboard(container, opts)  -> keyboard instance

   Keyboard options:
     low:   lowest note name shown      (default "C4")
     high:  highest note name shown     (default "C6")
     labels: "white" | "all" | "c" | "none"   (default "white")
     onClick: function(midi, name)      (optional)
   Keyboard methods:
     .highlight(noteOrMidi, className)  add a class to a key
     .label(noteOrMidi, text)           stamp custom text on a key
     .clearMarks()                      remove highlights/labels/badges
     .badge(noteOrMidi, text, cls)      put a small number/letter on a key
     .keyEl(noteOrMidi)                 -> the DOM element for that key
   ============================================================================ */
(function () {
  "use strict";

  var NAMES_SHARP = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  var NAMES_FLAT  = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];
  var PC = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 };
  var WHITE_PC = [0,2,4,5,7,9,11];

  function midi(name) {
    var m = /^([A-Ga-g])([#b]*)(-?\d+)$/.exec(String(name).trim());
    if (!m) throw new Error("Bad note name: " + name);
    var pc = PC[m[1].toUpperCase()];
    for (var i = 0; i < m[2].length; i++) pc += (m[2][i] === "#" ? 1 : -1);
    return (parseInt(m[3], 10) + 1) * 12 + pc;
  }
  function pc(m) { return ((m % 12) + 12) % 12; }
  function octave(m) { return Math.floor(m / 12) - 1; }
  function name(m, opt) {
    var tbl = (opt && opt.flat) ? NAMES_FLAT : NAMES_SHARP;
    return tbl[pc(m)] + octave(m);
  }
  function isWhite(m) { return WHITE_PC.indexOf(pc(m)) !== -1; }
  function isBlack(m) { return !isWhite(m); }

  var INTERVALS = [
    { semitones: 0,  name: "unison",        abbr: "P1" },
    { semitones: 1,  name: "half step",     abbr: "m2" },
    { semitones: 2,  name: "whole step",    abbr: "M2" },
    { semitones: 3,  name: "minor third",   abbr: "m3" },
    { semitones: 4,  name: "major third",   abbr: "M3" },
    { semitones: 5,  name: "perfect fourth",abbr: "P4" },
    { semitones: 6,  name: "tritone",       abbr: "TT" },
    { semitones: 7,  name: "perfect fifth", abbr: "P5" },
    { semitones: 8,  name: "minor sixth",   abbr: "m6" },
    { semitones: 9,  name: "major sixth",   abbr: "M6" },
    { semitones: 10, name: "minor seventh", abbr: "m7" },
    { semitones: 11, name: "major seventh", abbr: "M7" },
    { semitones: 12, name: "octave",        abbr: "P8" }
  ];
  function intervalName(s) {
    var hit = INTERVALS.filter(function (i) { return i.semitones === s; })[0];
    return hit ? hit.name : (s + " semitones");
  }

  var MAJOR_STEPS = [2, 2, 1, 2, 2, 2, 1];
  // Build a major scale as proper letter names (each letter used once), so the
  // spelling comes out C D E F G A B and G A B C D E F# (not Gb), etc.
  var LETTERS = ["C","D","E","F","G","A","B"];
  function majorScale(rootName, opt) {
    var m = /^([A-Ga-g])([#b]*)(-?\d+)?$/.exec(String(rootName).trim());
    if (!m) throw new Error("Bad root: " + rootName);
    var startLetter = m[1].toUpperCase();
    var startMidi = midi(startLetter + (m[2] || "") + (m[3] || "4"));
    var li = LETTERS.indexOf(startLetter);
    var notes = [startMidi];
    var cur = startMidi;
    for (var i = 0; i < 7; i++) {
      cur += MAJOR_STEPS[i];
      notes.push(cur);
    }
    // Spell each note with the next letter; choose accidental to match midi.
    var out = [name(notes[0], opt)];
    for (var k = 1; k < notes.length; k++) {
      var letter = LETTERS[(li + k) % 7];
      var basePc = PC[letter];
      var wantPc = pc(notes[k]);
      var diff = ((wantPc - basePc + 18) % 12) - 6; // -6..+5, nearest
      var acc = diff > 0 ? repeat("#", diff) : repeat("b", -diff);
      out.push(letter + acc + octave(notes[k]));
    }
    return out;
  }
  function repeat(s, n) { var r = ""; for (var i = 0; i < n; i++) r += s; return r; }

  /* ---------------- Keyboard renderer ----------------------------------- */
  function Keyboard(container, opts) {
    if (typeof container === "string") container = document.querySelector(container);
    opts = opts || {};
    this.el = container;
    this.lo = midi(opts.low || "C4");
    this.hi = midi(opts.high || "C6");
    this.labels = opts.labels || "white";
    this.onClick = opts.onClick || null;
    this.keys = {};            // midi -> {el, label}
    this._render();
  }

  Keyboard.prototype._render = function () {
    var self = this;
    var whites = [];
    for (var m = this.lo; m <= this.hi; m++) if (isWhite(m)) whites.push(m);

    var root = document.createElement("div");
    root.className = "keyboard";
    root.style.setProperty("--white-count", whites.length);

    // White keys first (flow layout).
    whites.forEach(function (m, idx) {
      var k = self._makeKey(m, "wkey", idx);
      root.appendChild(k);
    });

    // Black keys, absolutely positioned over the gaps.
    var whiteW = 100 / whites.length; // percent
    for (var mm = this.lo; mm <= this.hi; mm++) {
      if (!isBlack(mm)) continue;
      var whitesBefore = 0;
      for (var w = this.lo; w < mm; w++) if (isWhite(w)) whitesBefore++;
      var k2 = self._makeKey(mm, "bkey", null);
      // center the black key on the boundary between the surrounding whites
      k2.style.left = (whitesBefore * whiteW) + "%";
      k2.style.width = (whiteW * 0.62) + "%";
      k2.style.marginLeft = "-" + (whiteW * 0.31) + "%";
      root.appendChild(k2);
    }

    this.el.innerHTML = "";
    this.el.appendChild(root);
    this.root = root;
  };

  Keyboard.prototype._makeKey = function (m, cls, whiteIdx) {
    var self = this;
    var k = document.createElement(this.onClick ? "button" : "div");
    k.className = "key " + cls;
    k.dataset.midi = m;
    k.setAttribute("data-name", name(m));
    if (this.onClick) {
      k.type = "button";
      k.addEventListener("click", function () { self.onClick(m, name(m)); });
    }
    var lab = document.createElement("span");
    lab.className = "klabel";
    var show =
      this.labels === "all" ||
      (this.labels === "white" && isWhite(m)) ||
      (this.labels === "c" && pc(m) === 0);
    lab.textContent = show ? NAMES_SHARP[pc(m)] : "";
    k.appendChild(lab);

    var badge = document.createElement("span");
    badge.className = "kbadge";
    k.appendChild(badge);

    this.keys[m] = { el: k, label: lab, badge: badge };
    return k;
  };

  Keyboard.prototype._mid = function (x) {
    return typeof x === "number" ? x : midi(x);
  };
  Keyboard.prototype.keyEl = function (x) {
    var rec = this.keys[this._mid(x)];
    return rec ? rec.el : null;
  };
  Keyboard.prototype.highlight = function (x, cls) {
    var rec = this.keys[this._mid(x)];
    if (rec) rec.el.classList.add(cls || "hi");
    return this;
  };
  Keyboard.prototype.label = function (x, text) {
    var rec = this.keys[this._mid(x)];
    if (rec) { rec.label.textContent = text; rec.label.classList.add("forced"); }
    return this;
  };
  Keyboard.prototype.badge = function (x, text, cls) {
    var rec = this.keys[this._mid(x)];
    if (rec) {
      rec.badge.textContent = text;
      rec.badge.className = "kbadge show" + (cls ? " " + cls : "");
    }
    return this;
  };
  Keyboard.prototype.clearMarks = function () {
    for (var m in this.keys) {
      var rec = this.keys[m];
      rec.el.className = rec.el.className.replace(/\b(hi|hi2|root|step|dim)\b/g, "").trim();
      rec.badge.className = "kbadge";
      rec.badge.textContent = "";
      if (rec.label.classList.contains("forced")) {
        rec.label.classList.remove("forced");
        var show =
          this.labels === "all" ||
          (this.labels === "white" && isWhite(+m)) ||
          (this.labels === "c" && pc(+m) === 0);
        rec.label.textContent = show ? NAMES_SHARP[pc(+m)] : "";
      }
    }
    return this;
  };

  window.Music = {
    NAMES_SHARP: NAMES_SHARP, NAMES_FLAT: NAMES_FLAT,
    midi: midi, name: name, pc: pc, octave: octave,
    isWhite: isWhite, isBlack: isBlack,
    INTERVALS: INTERVALS, intervalName: intervalName,
    MAJOR_STEPS: MAJOR_STEPS, majorScale: majorScale,
    Keyboard: Keyboard
  };
})();
