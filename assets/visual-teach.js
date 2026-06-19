/* visual-teach — lesson behaviour. Auto-inits on DOMContentLoaded.
   Quizzes: <div class="vt-quiz" data-answer="N"> with button.opt + .feedback +
            optional <template data-opt="N"> per-option feedback +
            <template class="why-good"> / <template class="why-bad">.
            Flags: data-multi (multi-select), data-try-again (retry mode).
   Checklists: <ol class="vt-checklist" data-key="unique-key"> with li>input.
   Persistence keys off data-key; progress bar + count label + reset auto-injected. */

function announce(liveRegion, text) {
  if (liveRegion) liveRegion.textContent = text;
}

export function wireQuiz(quiz) {
  var isMulti = quiz.hasAttribute('data-multi');
  var tryAgain = quiz.hasAttribute('data-try-again');

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
    _wireSingle(quiz, answers[0], opts, fb, goodT, badT, liveRegion, tryAgain);
  }
}

function _wireSingle(quiz, answer, opts, fb, goodT, badT, liveRegion, tryAgain) {
  function reveal(chosen) {
    opts.forEach(function (b) { b.classList.remove('correct', 'wrong'); });
    if (opts[answer]) opts[answer].classList.add('correct');

    var isCorrect = chosen === answer;
    var whyGood = goodT ? goodT.innerHTML : 'Correct.';

    if (isCorrect) {
      fb.className = 'feedback show good';
      fb.innerHTML = '<span class="vt-fb-verdict">&#10004;</span> ' + whyGood;
      announce(liveRegion, fb.textContent);
      opts.forEach(function (b) { b.disabled = true; });
    } else {
      var perOptT = quiz.querySelector('template[data-opt="' + chosen + '"]');
      var whyBad = perOptT ? perOptT.innerHTML : (badT ? badT.innerHTML : 'Not quite.');
      opts[chosen].classList.add('wrong');
      fb.className = 'feedback show bad';
      fb.innerHTML =
        '<span class="vt-fb-verdict">&#10008;</span> ' + whyBad +
        '<div class="vt-fb-correct"><span class="vt-fb-verdict">&#10004;</span> ' + whyGood + '</div>';
      announce(liveRegion, fb.textContent);

      if (tryAgain) {
        var existingTry = quiz.querySelector('.vt-quiz-try-again');
        if (!existingTry) {
          var tryBtn = document.createElement('button');
          tryBtn.type = 'button';
          tryBtn.className = 'vt-quiz-try-again';
          tryBtn.textContent = 'Try again';
          tryBtn.addEventListener('click', function () {
            opts.forEach(function (b) {
              b.classList.remove('correct', 'wrong');
              b.disabled = false;
            });
            fb.className = 'feedback';
            fb.innerHTML = '';
            announce(liveRegion, '');
            tryBtn.remove();
          });
          fb.parentNode.insertBefore(tryBtn, fb.nextSibling);
        }
      } else {
        opts.forEach(function (b) { b.disabled = true; });
      }
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

  list.parentNode.insertBefore(barWrap, list);
  list.parentNode.insertBefore(progress, list);

  var reset = document.createElement('button');
  reset.className = 'vt-reset';
  reset.type = 'button';
  reset.textContent = 'Reset checklist';
  if (list.nextSibling) list.parentNode.insertBefore(reset, list.nextSibling);
  else list.parentNode.appendChild(reset);

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

function wireCodeBlock(block) {
  var btn = block.querySelector('.vt-code-copy');
  var pre = block.querySelector('pre');
  if (!btn || !pre) return;
  btn.addEventListener('click', function () {
    var text = pre.textContent || '';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        btn.textContent = 'Copied!';
        setTimeout(function () { btn.textContent = 'Copy'; }, 2000);
      }).catch(function () {});
    }
  });
}

function initPrism() {
  if (typeof Prism === 'undefined') return;
  if (!document.querySelector('.vt-code code[class*="language-"]')) return;
  try { Prism.highlightAll(); } catch (e) {}
}

function init() {
  document.querySelectorAll('.vt-quiz').forEach(wireQuiz);
  document.querySelectorAll('.vt-checklist').forEach(wireChecklist);
  document.querySelectorAll('.vt-code').forEach(wireCodeBlock);
  initPrism();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
