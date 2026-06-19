/* visual-teach — lesson behaviour. Auto-inits on DOMContentLoaded.
   Quizzes: <div class="vt-quiz" data-answer="N"> with button.opt + .feedback +
            optional <template data-opt="N"> per-option feedback +
            <template class="why-good"> / <template class="why-bad">.
            Flag: data-multi (multi-select). Single-answer always retries.
   Checklists: <ol class="vt-checklist" data-key="unique-key"> with li>input.
   Persistence keys off data-key; progress bar + count label + reset auto-injected. */

function announce(liveRegion, text) {
  if (liveRegion) liveRegion.textContent = text;
}

export function wireQuiz(quiz) {
  var isMulti = quiz.hasAttribute('data-multi');

  var answers = quiz.dataset.answer
    ? quiz.dataset.answer.split(',').map(function (s) { return parseInt(s.trim(), 10); })
    : [0];

  var opts = quiz.querySelectorAll('button.opt');
  var fb = quiz.querySelector('.feedback');
  var goodT = quiz.querySelector('template.why-good');
  var badT = quiz.querySelector('template.why-bad');
  var liveRegion = quiz.querySelector('[aria-live]');

  quiz.setAttribute('role', 'group');
  opts.forEach(function (btn) {
    btn.setAttribute('type', 'button');
  });

  if (isMulti) {
    _wireMulti(quiz, answers, opts, fb, goodT, badT, liveRegion);
  } else {
    _wireSingle(quiz, answers[0], opts, fb, goodT, badT, liveRegion);
  }
}

function _wireSingle(quiz, answer, opts, fb, goodT, badT, liveRegion) {
  // Single-answer never locks: a wrong pick shows feedback without revealing the
  // answer, and the learner keeps picking until correct. Buttons stay clickable
  // even after a correct pick, so they can browse the wrong-answer explanations.
  function reveal(chosen) {
    opts.forEach(function (b) { b.classList.remove('correct', 'wrong'); });

    var isCorrect = chosen === answer;
    if (isCorrect && opts[answer]) opts[answer].classList.add('correct');

    var whyGood = goodT ? goodT.innerHTML : 'Correct.';

    if (isCorrect) {
      fb.className = 'feedback show good';
      fb.innerHTML = '<span class="vt-fb-verdict">&#10004;</span> ' + whyGood;
      announce(liveRegion, fb.textContent);
    } else {
      var perOptT = quiz.querySelector('template[data-opt="' + chosen + '"]');
      var whyBad = perOptT ? perOptT.innerHTML : (badT ? badT.innerHTML : 'Not quite.');
      opts[chosen].classList.add('wrong');
      fb.className = 'feedback show bad';
      fb.innerHTML = '<span class="vt-fb-verdict">&#10008;</span> ' + whyBad;
      announce(liveRegion, fb.textContent);
      // leave buttons enabled — learner keeps trying until correct.
    }
  }

  opts.forEach(function (btn, i) {
    btn.addEventListener('click', function () { reveal(i); });
  });
}

function _wireMulti(quiz, answers, opts, fb, goodT, badT, liveRegion) {
  var selected = new Set();

  opts.forEach(function (btn, i) {
    btn.setAttribute('aria-pressed', 'false');
    btn.addEventListener('click', function () {
      if (btn.disabled) return;
      var pressed = selected.has(i);
      if (pressed) {
        selected.delete(i);
        btn.setAttribute('aria-pressed', 'false');
        btn.classList.remove('selected');
      } else {
        selected.add(i);
        btn.setAttribute('aria-pressed', 'true');
        btn.classList.add('selected');
      }
    });
  });

  var checkBtn = document.createElement('button');
  checkBtn.type = 'button';
  checkBtn.className = 'vt-quiz-check';
  checkBtn.textContent = 'Check answer';
  fb.parentNode.insertBefore(checkBtn, fb);

  checkBtn.addEventListener('click', function () {
    var allCorrect = answers.every(function (a) { return selected.has(a); }) &&
      Array.from(selected).every(function (s) { return answers.indexOf(s) !== -1; });

    opts.forEach(function (btn, i) {
      btn.classList.remove('correct', 'wrong', 'selected');
      btn.setAttribute('aria-pressed', 'false');
      var isAnswer = answers.indexOf(i) !== -1;
      if (selected.has(i)) {
        btn.classList.add(isAnswer ? 'correct' : 'wrong');
      } else if (isAnswer) {
        btn.classList.add('correct');
      }
      btn.disabled = true;
    });

    var whyGood = goodT ? goodT.innerHTML : 'Correct.';
    if (allCorrect) {
      fb.className = 'feedback show good';
      fb.innerHTML = '<span class="vt-fb-verdict">&#10004;</span> ' + whyGood;
    } else {
      fb.className = 'feedback show bad';
      fb.innerHTML =
        '<span class="vt-fb-verdict">&#10008;</span> ' + (badT ? badT.innerHTML : 'Not quite.') +
        '<div class="vt-fb-correct"><span class="vt-fb-verdict">&#10004;</span> ' + whyGood + '</div>';
    }
    announce(liveRegion, fb.textContent);
    checkBtn.remove();
  });
}

export function wireChecklist(list) {
  var key = 'vt-checklist:' + (list.dataset.key || location.pathname);
  var boxes = list.querySelectorAll('input[type="checkbox"]');
  var total = boxes.length;

  boxes.forEach(function (b, i) {
    if (!b.dataset.i) b.dataset.i = String(i);
    if (!b.id) b.id = 'vt-cl-' + (list.dataset.key || 'x') + '-' + i;
    if (!b.labels || b.labels.length === 0) {
      var lbl = document.createElement('label');
      lbl.setAttribute('for', b.id);
      var sibling = b.nextElementSibling;
      if (sibling && sibling.tagName !== 'LABEL') {
        lbl.appendChild(sibling);
      }
      b.parentNode.insertBefore(lbl, b.nextSibling);
    }
  });

  var saved = {};
  try { saved = JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) {}

  var barWrap = document.createElement('div');
  barWrap.className = 'vt-progress-bar';
  barWrap.setAttribute('role', 'progressbar');
  barWrap.setAttribute('aria-valuemin', '0');
  barWrap.setAttribute('aria-valuemax', '100');
  barWrap.setAttribute('aria-valuenow', '0');

  var barFill = document.createElement('div');
  barFill.className = 'vt-progress-bar-fill';
  barFill.style.width = '0%';
  barWrap.appendChild(barFill);

  var progress = document.createElement('p');
  progress.className = 'vt-progress';

  var reset = document.createElement('button');
  reset.className = 'vt-reset';
  reset.type = 'button';
  reset.textContent = 'Reset';

  // count label + compact reset share one row above the bar
  var head = document.createElement('div');
  head.className = 'vt-progress-head';
  head.appendChild(progress);
  head.appendChild(reset);

  list.parentNode.insertBefore(head, list);
  list.parentNode.insertBefore(barWrap, list);

  function render() {
    var done = 0;
    boxes.forEach(function (b) { if (b.checked) done++; });
    var pct = total > 0 ? Math.round((done / total) * 100) : 0;
    barFill.style.width = pct + '%';
    barWrap.setAttribute('aria-valuenow', String(pct));
    progress.textContent = done === total
      ? '✅ All ' + total + ' steps done.'
      : done + ' of ' + total + ' steps done';
  }

  function save() {
    try { localStorage.setItem(key, JSON.stringify(saved)); } catch (e) {}
  }

  boxes.forEach(function (b) {
    b.checked = !!saved[b.dataset.i];
    b.addEventListener('change', function () {
      saved[b.dataset.i] = b.checked;
      save();
      render();
    });
  });

  reset.addEventListener('click', function () {
    boxes.forEach(function (b) { b.checked = false; saved[b.dataset.i] = false; });
    save();
    render();
  });

  render();
}

var COPY_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
var CHECK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

function wireCodeBlock(block) {
  var btn = block.querySelector('.vt-code-copy');
  var pre = block.querySelector('pre');
  if (!btn || !pre) return;
  btn.innerHTML = COPY_ICON;
  if (!btn.getAttribute('aria-label')) btn.setAttribute('aria-label', 'Copy code');
  btn.addEventListener('click', function () {
    var text = pre.textContent || '';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        btn.innerHTML = CHECK_ICON;
        setTimeout(function () { btn.innerHTML = COPY_ICON; }, 2000);
      }).catch(function () {});
    }
  });
}

function initPrism() {
  if (typeof Prism === 'undefined') return;
  if (!document.querySelector('.vt-code code[class*="language-"]')) return;
  try { Prism.highlightAll(); } catch (e) {}
}

/* Theme bridge: let an embedding parent (e.g. an iframe-based before/after
   compare page) set the lesson theme via postMessage({vtTheme:'dark'|'light'}).
   Cross-origin-safe, so it works even when lessons are opened over file://,
   where the parent cannot reach contentDocument. */
export function wireThemeBridge(win) {
  win.addEventListener('message', function (e) {
    var t = e.data && e.data.vtTheme;
    if (t === 'dark' || t === 'light') win.document.documentElement.dataset.theme = t;
  });
}

function slugify(s) {
  return s.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

/* Make every section heading linkable: slug -> id, inject a hover "#" anchor.
   Skips headings that already carry an anchor (hand-authored demos). */
function wireAnchors() {
  var seen = {};
  document.querySelectorAll('h2, h3').forEach(function (h) {
    if (h.querySelector('.vt-anchor')) return;
    var clone = h.cloneNode(true);
    clone.querySelectorAll('.vt-num, .sc-sub, .vt-anchor').forEach(function (n) { n.remove(); });
    var base = slugify(clone.textContent || '');
    if (!base) return;
    var slug = h.id || base, n = 1;
    while (!h.id && seen[slug]) { n++; slug = base + '-' + n; }
    seen[slug] = true;
    if (!h.id) h.id = slug;
    var a = document.createElement('a');
    a.className = 'vt-anchor';
    a.href = '#' + h.id;
    a.setAttribute('aria-label', 'Link to this section');
    a.textContent = '#';
    h.appendChild(a);
  });
}

function init() {
  document.querySelectorAll('.vt-quiz').forEach(wireQuiz);
  document.querySelectorAll('.vt-checklist').forEach(wireChecklist);
  document.querySelectorAll('.vt-code').forEach(wireCodeBlock);
  wireAnchors();
  initPrism();
  if (typeof window !== 'undefined') wireThemeBridge(window);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
