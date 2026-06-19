/* visual-teach — lesson behavior. Auto-inits on load.
   Quizzes: <div class="vt-quiz" data-answer="N"> with button.opt + .feedback +
            <template class="why-good"> / <template class="why-bad">.
   Checklists: <ol class="vt-checklist" data-key="unique-key"> with li>input.
   Persistence keys off data-key; progress line + reset button auto-injected. */
(function () {
  'use strict';

  function wireQuiz(quiz) {
    var answer = parseInt(quiz.dataset.answer, 10);
    var opts = quiz.querySelectorAll('button.opt');
    var fb = quiz.querySelector('.feedback');
    var goodT = quiz.querySelector('template.why-good');
    var badT = quiz.querySelector('template.why-bad');
    var good = goodT ? goodT.innerHTML : 'Correct.';
    var bad = badT ? badT.innerHTML : 'Not quite.';
    opts.forEach(function (btn, i) {
      btn.addEventListener('click', function () {
        opts.forEach(function (b) { b.classList.remove('correct', 'wrong'); });
        if (opts[answer]) opts[answer].classList.add('correct');
        if (i === answer) {
          fb.className = 'feedback show good';
          fb.innerHTML = '✔ ' + good;
        } else {
          btn.classList.add('wrong');
          fb.className = 'feedback show bad';
          fb.innerHTML = '✘ ' + bad;
        }
      });
    });
  }

  function wireChecklist(list) {
    var key = 'vt-checklist:' + (list.dataset.key || location.pathname);
    var boxes = list.querySelectorAll('input[type="checkbox"]');
    // give each box a stable id within the list
    boxes.forEach(function (b, i) { if (!b.dataset.i) b.dataset.i = String(i); });

    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) {}

    var progress = document.createElement('p');
    progress.className = 'vt-progress';
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
      progress.textContent = done === boxes.length
        ? '✅ All ' + boxes.length + ' steps done.'
        : done + ' of ' + boxes.length + ' steps done';
    }
    function save() { try { localStorage.setItem(key, JSON.stringify(saved)); } catch (e) {} }

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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
