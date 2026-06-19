/* visual-teach — lesson behaviour. Auto-inits on DOMContentLoaded.
   Quizzes: <div class="vt-quiz" data-answer="N"> with button.opt + .feedback +
            optional <template data-opt="N"> per-option feedback +
            <template class="why-good"> / <template class="why-bad">.
            Flags: data-multi (multi-select), data-try-again (retry mode).
   Checklists: <ol class="vt-checklist" data-key="unique-key"> with li>input.
   Persistence keys off data-key; progress bar + count label + reset auto-injected. */

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

  // a11y: mark as group, ensure buttons are type=button
  quiz.setAttribute('role', 'group');
  opts.forEach(function (btn) {
    btn.setAttribute('type', 'button');
  });

  if (isMulti) {
    _wireMulti(quiz, answers, opts, fb, goodT, badT, liveRegion, tryAgain);
  } else {
    _wireSingle(quiz, answers[0], opts, fb, goodT, badT, liveRegion, tryAgain);
  }
}

function _wireSingle(quiz, answer, opts, fb, goodT, badT, liveRegion, tryAgain) {
  function announce(text) {
    if (liveRegion) liveRegion.textContent = text;
  }

  function reveal(chosen) {
    // mark correct option always
    opts.forEach(function (b) { b.classList.remove('correct', 'wrong'); });
    if (opts[answer]) opts[answer].classList.add('correct');

    var isCorrect = chosen === answer;
    var whyGood = goodT ? goodT.innerHTML : 'Correct.';

    // per-option template for wrong options; fallback to why-bad
    var perOptT = quiz.querySelector('template[data-opt="' + chosen + '"]');
    var whyBad = perOptT
      ? perOptT.innerHTML
      : (badT ? badT.innerHTML : 'Not quite.');

    if (isCorrect) {
      opts[chosen].classList.add('correct');
      fb.className = 'feedback show good';
      fb.innerHTML = '<span class="vt-fb-verdict">&#10004;</span> ' + whyGood;
      announce(fb.textContent);
      // lock
      opts.forEach(function (b) { b.disabled = true; });
    } else {
      opts[chosen].classList.add('wrong');
      fb.className = 'feedback show bad';
      // Show per-option misconception + always-on correct explanation
      fb.innerHTML =
        '<span class="vt-fb-verdict">&#10008;</span> ' + whyBad +
        '<div class="vt-fb-correct"><span class="vt-fb-verdict">&#10004;</span> ' + whyGood + '</div>';
      announce(fb.textContent);

      if (tryAgain) {
        // leave buttons enabled; add Try again button
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
            announce('');
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

function _wireMulti(quiz, answers, opts, fb, goodT, badT, liveRegion, tryAgain) {
  var selected = new Set();

  function announce(text) {
    if (liveRegion) liveRegion.textContent = text;
  }

  // Toggle aria-pressed per option click (no immediate reveal)
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

  // "Check answer" button
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
        btn.classList.add('correct'); // show missed correct answer
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
    announce(fb.textContent);
    checkBtn.remove();
  });
}

export function wireChecklist(list) {
  var key = 'vt-checklist:' + (list.dataset.key || location.pathname);
  var boxes = list.querySelectorAll('input[type="checkbox"]');
  var total = boxes.length;

  // Give each box a stable id + associate a label
  boxes.forEach(function (b, i) {
    if (!b.dataset.i) b.dataset.i = String(i);
    // Assign id if missing
    if (!b.id) b.id = 'vt-cl-' + (list.dataset.key || 'x') + '-' + i;
    // Wrap or create label if no associated label exists
    if (!b.labels || b.labels.length === 0) {
      var lbl = document.createElement('label');
      lbl.setAttribute('for', b.id);
      // Move sibling content (the div with step-title/body) into label
      var sibling = b.nextElementSibling;
      if (sibling && sibling.tagName !== 'LABEL') {
        lbl.appendChild(sibling);
      }
      b.parentNode.insertBefore(lbl, b.nextSibling);
    }
  });

  var saved = {};
  try { saved = JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) {}

  // Progress bar container (with aria progressbar role)
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

  // Progress text label
  var progress = document.createElement('p');
  progress.className = 'vt-progress';

  // Insert bar then text above the list
  list.parentNode.insertBefore(barWrap, list);
  list.parentNode.insertBefore(progress, list);

  // Reset button after list
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

function init() {
  document.querySelectorAll('.vt-quiz').forEach(wireQuiz);
  document.querySelectorAll('.vt-checklist').forEach(wireChecklist);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
