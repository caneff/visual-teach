/* ============================================================================
   keyboard.js — shared, reusable piano-keyboard renderer + teaching widgets
   for the "Twelve Notes" course. Plain vanilla JS, no dependencies. Every
   lesson links this file; nothing here is lesson-specific.

   Model: the octave is twelve semitones. Pitch classes 0..11 map to:
     0 C  1 C♯/D♭  2 D  3 D♯/E♭  4 E  5 F  6 F♯/G♭  7 G  8 G♯/A♭  9 A
     10 A♯/B♭  11 B
   An "absolute semitone" is octave*12 + pitchClass, counting up from a left C.
   Distance between two notes = difference of their absolute semitones. That is
   the whole arithmetic of the course.
   ========================================================================== */

const PC_NAMES = [
  "C", "C♯/D♭", "D", "D♯/E♭", "E", "F",
  "F♯/G♭", "G", "G♯/A♭", "A", "A♯/B♭", "B"
];
const WHITE_PCS  = [0, 2, 4, 5, 7, 9, 11];      // C D E F G A B
const WHITE_NAMES = ["C", "D", "E", "F", "G", "A", "B"];
// black key sits after the white key at this in-octave index → its pitch class
const BLACK_AFTER = { 0: 1, 1: 3, 3: 6, 4: 8, 5: 10 };

const WHITE_W = 42;   // must match .key.white width in styles.css
const BLACK_W = 28;   // must match .key.black width

/* Render a keyboard into `container`.
   opts = { octaves=1, startOctave=4, trailingC=false, labels=true,
            semitoneNumbers=false, onKey=fn(absSemi, el) }
   Returns an API: { highlight, clear, bySemi, names, lo, hi } */
function renderKeyboard(container, opts = {}) {
  const octaves        = opts.octaves ?? 1;
  const startOctave    = opts.startOctave ?? 4;
  const trailingC      = opts.trailingC ?? false;
  const labels         = opts.labels ?? true;
  const semitoneNumbers = opts.semitoneNumbers ?? false;

  container.innerHTML = "";
  const kb = document.createElement("div");
  kb.className = "keyboard";

  const bySemi = {};            // absSemi -> key element
  let whiteCount = 0;

  // --- white keys (laid out in normal flow) ---
  const totalWhite = octaves * 7 + (trailingC ? 1 : 0);
  for (let i = 0; i < totalWhite; i++) {
    const o   = Math.floor(i / 7);
    const wi  = i % 7;
    const pc  = WHITE_PCS[wi];
    const abs = o * 12 + pc;
    const key = document.createElement("div");
    key.className = "white key";
    key.dataset.semi = abs;
    if (labels) {
      const lbl = document.createElement("span");
      lbl.className = "lbl";
      lbl.textContent = WHITE_NAMES[wi] + (startOctave + o);
      key.appendChild(lbl);
    }
    if (semitoneNumbers) addBadge(key, abs);
    kb.appendChild(key);
    bySemi[abs] = key;
    whiteCount++;
    if (opts.onKey) key.addEventListener("click", () => opts.onKey(abs, key));
  }

  // --- black keys (absolutely positioned over the boundaries) ---
  for (let o = 0; o < octaves; o++) {
    for (const wi of [0, 1, 3, 4, 5]) {
      const globalWhite = o * 7 + wi;     // index of the white key it sits after
      const pc  = BLACK_AFTER[wi];
      const abs = o * 12 + pc;
      const key = document.createElement("div");
      key.className = "black key";
      key.dataset.semi = abs;
      key.style.left = (globalWhite + 1) * WHITE_W - BLACK_W / 2 + "px";
      if (labels) {
        const lbl = document.createElement("span");
        lbl.className = "lbl";
        lbl.innerHTML = PC_NAMES[pc].replace("/", "<br>");
        key.appendChild(lbl);
      }
      if (semitoneNumbers) addBadge(key, abs);
      kb.appendChild(key);
      bySemi[abs] = key;
      if (opts.onKey) key.addEventListener("click", () => opts.onKey(abs, key));
    }
  }

  container.appendChild(kb);

  const allSemis = Object.keys(bySemi).map(Number);
  const api = {
    el: kb,
    bySemi,
    lo: Math.min(...allSemis),
    hi: Math.max(...allSemis),
    names: PC_NAMES,
    highlight(abs, cls = "hi") {
      const k = bySemi[abs];
      if (k) k.classList.add(cls);
    },
    badge(abs, text) {
      const k = bySemi[abs];
      if (!k) return;
      let b = k.querySelector(".badge");
      if (!b) { b = document.createElement("span"); b.className = "badge"; k.appendChild(b); }
      b.textContent = text;
    },
    clear(...classes) {
      const list = classes.length ? classes : ["hi", "root", "scale", "lit"];
      Object.values(bySemi).forEach(k => {
        list.forEach(c => k.classList.remove(c));
        const b = k.querySelector(".badge");
        if (b && !semitoneNumbers) b.remove();
      });
    }
  };
  return api;

  function addBadge(key, abs) {
    const b = document.createElement("span");
    b.className = "badge";
    b.textContent = ((abs % 12) + 12) % 12; // not used much; left for clarity
    key.appendChild(b);
  }
}

/* Friendly name of a pitch class for prompts, preferring a single spelling. */
function noteName(abs) {
  return PC_NAMES[((abs % 12) + 12) % 12];
}

/* ----------------------------------------------------------------------------
   WIDGET 1 — Interval trainer (Lesson 2)
   Shows two lit keys; the learner counts the semitone distance, then names it.
   Tight feedback loop: immediate right/wrong, score kept, "next" to repeat.
---------------------------------------------------------------------------- */
const INTERVALS = [
  { semi: 1,  name: "Half step",     blurb: "the smallest move — one key to its nearest neighbour" },
  { semi: 2,  name: "Whole step",    blurb: "two half steps; skips exactly one key between" },
  { semi: 4,  name: "Major third",   blurb: "bright, the bottom of a major chord" },
  { semi: 7,  name: "Perfect fifth", blurb: "open and stable — the most consonant non-octave" },
  { semi: 12, name: "Octave",        blurb: "same note name, twelve semitones higher" }
];

function startIntervalTrainer(rootEl, kbContainer) {
  const kb = renderKeyboard(kbContainer, { octaves: 2, startOctave: 4, trailingC: true });
  const promptEl   = rootEl.querySelector("[data-prompt]");
  const countWrap  = rootEl.querySelector("[data-count]");
  const nameWrap   = rootEl.querySelector("[data-name]");
  const fb         = rootEl.querySelector("[data-feedback]");
  const scoreEl    = rootEl.querySelector("[data-score]");
  const nextBtn    = rootEl.querySelector("[data-next]");

  let hits = 0, tries = 0, current = null, step = 0, seed = 0;

  function pick() {
    // deterministic-ish rotation (no Math.random needed): walk a coprime stride
    seed = (seed + 1);
    const iv = INTERVALS[(seed * 3) % INTERVALS.length];
    const maxRoot = kb.hi - iv.semi;
    const lowRoot = kb.lo;
    const root = lowRoot + ((seed * 5) % (maxRoot - lowRoot + 1));
    current = { iv, root, top: root + iv.semi };
  }

  function render() {
    kb.clear();
    kb.highlight(current.root, "root");
    kb.highlight(current.top, "lit");
    promptEl.innerHTML =
      `Bottom note: <strong>${noteName(current.root)}</strong> (red) &nbsp;·&nbsp; ` +
      `Top note: <strong>${noteName(current.top)}</strong> (blue). ` +
      `How many <em>semitones</em> apart?`;
    fb.className = "feedback"; fb.textContent = "";
    nameWrap.style.display = "none";
    nameWrap.innerHTML = "";
    buildCountChoices();
    nextBtn.style.display = "none";
  }

  function buildCountChoices() {
    countWrap.innerHTML = "";
    // four equal-width numeric options including the answer
    const opts = new Set([current.iv.semi]);
    const pool = [1, 2, 3, 4, 5, 7, 8, 12];
    let i = 0;
    while (opts.size < 4) { opts.add(pool[(seed + i++) % pool.length]); }
    const arr = [...opts].sort((a, b) => a - b);
    arr.forEach(n => {
      const b = document.createElement("button");
      b.className = "choice"; b.textContent = n;
      b.onclick = () => answerCount(n, b, arr);
      countWrap.appendChild(b);
    });
  }

  function answerCount(n, btn, arr) {
    tries++;
    [...countWrap.children].forEach(c => c.disabled = true);
    if (n === current.iv.semi) {
      hits++;
      btn.classList.add("correct");
      fb.className = "feedback good";
      fb.textContent = `✓ ${n} semitones. Now name it →`;
      showNameStep();
    } else {
      btn.classList.add("wrong");
      const right = [...countWrap.children].find(c => +c.textContent === current.iv.semi);
      if (right) right.classList.add("correct");
      fb.className = "feedback bad";
      fb.textContent = `Count again: each key — white or black — is one semitone. It was ${current.iv.semi}.`;
      showNameStep();
    }
    updateScore();
  }

  function showNameStep() {
    nameWrap.style.display = "block";
    nameWrap.innerHTML = `<div class="q-meta">And its name?</div>`;
    const choices = document.createElement("div");
    choices.className = "choices";
    const names = INTERVALS.map(x => x.name);
    names.forEach(nm => {
      const b = document.createElement("button");
      b.className = "choice"; b.textContent = nm;
      b.style.minWidth = "8rem";
      b.onclick = () => answerName(nm, b, choices);
      choices.appendChild(b);
    });
    nameWrap.appendChild(choices);
  }

  function answerName(nm, btn, choices) {
    [...choices.children].forEach(c => c.disabled = true);
    if (nm === current.iv.name) {
      btn.classList.add("correct");
      fb.className = "feedback good";
      fb.textContent = `✓ A ${current.iv.name} — ${current.iv.blurb}.`;
    } else {
      btn.classList.add("wrong");
      const right = [...choices.children].find(c => c.textContent === current.iv.name);
      if (right) right.classList.add("correct");
      fb.className = "feedback bad";
      fb.textContent = `It was a ${current.iv.name} — ${current.iv.blurb}.`;
    }
    nextBtn.style.display = "inline-block";
  }

  function updateScore() {
    scoreEl.textContent = `Score: ${hits} / ${tries}`;
  }

  nextBtn.onclick = () => { pick(); render(); };
  pick(); render(); updateScore();
}

/* ----------------------------------------------------------------------------
   WIDGET 2 — Scale builder (Lesson 3)
   Pick a root; the learner clicks the seven notes of the major scale by
   applying W-W-H-W-W-W-H. Each click is checked against the recipe.
---------------------------------------------------------------------------- */
const MAJOR_STEPS = [2, 2, 1, 2, 2, 2, 1];   // whole whole half whole whole whole half

function startScaleBuilder(rootEl, kbContainer) {
  const selRoot  = rootEl.querySelector("[data-root]");
  const fb       = rootEl.querySelector("[data-feedback]");
  const progress = rootEl.querySelector("[data-progress]");
  const resetBtn = rootEl.querySelector("[data-reset]");

  // roots available within the rendered two octaves (start at C4)
  const ROOTS = [
    { abs: 0,  label: "C major  (no sharps or flats)" },
    { abs: 7,  label: "G major  (one sharp: F♯)" },
    { abs: 5,  label: "F major  (one flat: B♭)" },
    { abs: 2,  label: "D major  (two sharps: F♯, C♯)" }
  ];
  ROOTS.forEach(r => {
    const o = document.createElement("option");
    o.value = r.abs; o.textContent = r.label;
    selRoot.appendChild(o);
  });

  let kb, target = [], idx = 0;

  function expectedScale(rootAbs) {
    const notes = [rootAbs];
    let cur = rootAbs;
    for (const s of MAJOR_STEPS) { cur += s; notes.push(cur); }
    return notes; // 8 entries: root … octave
  }

  function setup() {
    const rootAbs = +selRoot.value;
    kb = renderKeyboard(kbContainer, {
      octaves: 2, startOctave: 4, trailingC: true,
      onKey: onClick
    });
    target = expectedScale(rootAbs);
    idx = 0;
    kb.clear();
    kb.highlight(rootAbs, "root");
    fb.className = "feedback";
    fb.innerHTML = `Root <strong>${noteName(rootAbs)}</strong> is marked. ` +
      `Click the <strong>next</strong> note of the scale. First step: a <em>whole step</em> (2 semitones) up.`;
    drawProgress();
  }

  function stepLabel(i) {
    return MAJOR_STEPS[i] === 2 ? "Whole (2)" : "Half (1)";
  }

  function onClick(abs, el) {
    if (idx >= MAJOR_STEPS.length) return;       // scale already complete
    const want = target[idx + 1];
    const wantStep = MAJOR_STEPS[idx];
    if (abs === want) {
      kb.highlight(abs, "scale");
      kb.badge(abs, idx + 2);                     // 2nd, 3rd … degree number
      idx++;
      if (idx === MAJOR_STEPS.length) {
        fb.className = "feedback good";
        fb.innerHTML = `✓ Complete! You built <strong>${noteName(target[0])} major</strong>: ` +
          target.map(n => noteName(n).split("/")[0]).join(" – ") +
          `. The W-W-H-W-W-W-H pattern holds from any root.`;
      } else {
        fb.className = "feedback good";
        fb.innerHTML = `✓ Degree ${idx + 1} is <strong>${noteName(abs).split("/")[0]}</strong>. ` +
          `Next step: a <em>${MAJOR_STEPS[idx] === 2 ? "whole step (2)" : "half step (1)"}</em> up.`;
      }
    } else {
      el.classList.add("lit");
      setTimeout(() => el.classList.remove("lit"), 350);
      const dist = abs - target[idx];
      fb.className = "feedback bad";
      fb.innerHTML = `Not quite. From <strong>${noteName(target[idx]).split("/")[0]}</strong> the recipe says ` +
        `a <em>${wantStep === 2 ? "whole step (2 semitones)" : "half step (1 semitone)"}</em> — ` +
        `that lands on <strong>${noteName(want).split("/")[0]}</strong>.`;
    }
    drawProgress();
  }

  function drawProgress() {
    const cells = MAJOR_STEPS.map((s, i) => {
      const done = i < idx;
      const ch = s === 2 ? "W" : "H";
      return `<span style="display:inline-block;width:1.7rem;text-align:center;
        border-bottom:3px solid ${done ? "var(--good)" : "var(--rule)"};
        color:${done ? "var(--good)" : "var(--ink-soft)"};font-weight:700;">${ch}</span>`;
    }).join("");
    progress.innerHTML = `Recipe: ${cells} &nbsp; <span class="cite">(${idx}/7 steps placed)</span>`;
  }

  selRoot.onchange = setup;
  resetBtn.onclick = setup;
  setup();
}
