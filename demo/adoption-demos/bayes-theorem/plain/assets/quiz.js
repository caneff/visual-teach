/* ---------------------------------------------------------------------------
   Shared interactive-feedback widgets for the Bayes' theorem course.
   Tight feedback loop: the learner acts, the page responds immediately.
   Three behaviours, all wired by data-attributes so lessons stay markup-only.
   --------------------------------------------------------------------------- */

(function () {
  'use strict';

  /* --- Multiple choice -----------------------------------------------------
     <div class="quiz" data-quiz>
       <ul class="opts">
         <li><button class="opt" data-correct>...</button></li>
         <li><button class="opt" data-explain="why wrong">...</button></li>
       </ul>
       <div class="feedback right" data-fb-right>...</div>
       <div class="feedback nope"  data-fb-nope>...</div>
     </div>
  */
  document.querySelectorAll('[data-quiz]').forEach(function (quiz) {
    var opts = quiz.querySelectorAll('.opt');
    var fbRight = quiz.querySelector('[data-fb-right]');
    var fbNope = quiz.querySelector('[data-fb-nope]');
    opts.forEach(function (opt) {
      opt.addEventListener('click', function () {
        var correct = opt.hasAttribute('data-correct');
        opts.forEach(function (o) {
          o.disabled = true;
          if (o.hasAttribute('data-correct')) o.classList.add('correct');
        });
        if (!correct) opt.classList.add('wrong');
        if (correct && fbRight) fbRight.classList.add('show');
        if (!correct) {
          if (opt.dataset.explain && fbNope) {
            fbNope.innerHTML = opt.dataset.explain;
          }
          if (fbNope) fbNope.classList.add('show');
        }
      });
    });
  });

  /* --- Numeric check -------------------------------------------------------
     <div class="checkbox-row" data-numeric
          data-answer="29" data-tol="1" data-unit="%">
       <input type="text"> <button>Check</button>
     </div>
     <div class="feedback" data-numeric-fb-right>...</div>
     <div class="feedback" data-numeric-fb-nope>...</div>
     The two feedback blocks must immediately follow the row.
  */
  document.querySelectorAll('[data-numeric]').forEach(function (row) {
    var input = row.querySelector('input');
    var btn = row.querySelector('button');
    var answer = parseFloat(row.dataset.answer);
    var tol = parseFloat(row.dataset.tol || '0.5');
    var right = row.parentNode.querySelector('[data-numeric-fb-right]');
    var nope = row.parentNode.querySelector('[data-numeric-fb-nope]');
    function check() {
      var raw = (input.value || '').replace(/[%\s,]/g, '');
      var val = parseFloat(raw);
      if (right) right.classList.remove('show');
      if (nope) nope.classList.remove('show');
      if (isNaN(val)) { if (nope) { nope.classList.add('show'); } return; }
      if (Math.abs(val - answer) <= tol) {
        if (right) right.classList.add('show');
        input.style.borderColor = 'var(--good)';
      } else {
        if (nope) nope.classList.add('show');
        input.style.borderColor = 'var(--bad)';
      }
    }
    if (btn) btn.addEventListener('click', check);
    if (input) input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') check();
    });
  });

  /* --- Reveal toggle (worked solutions, recall answers) --------------------
     <button class="reveal-btn" data-reveal="#id">Show working</button>
     <div class="workings" id="id">...</div>
  */
  document.querySelectorAll('[data-reveal]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = document.querySelector(btn.dataset.reveal);
      if (!target) return;
      var open = target.classList.toggle('show');
      btn.textContent = open
        ? (btn.dataset.hide || 'Hide working')
        : (btn.dataset.show || 'Show working');
    });
  });
})();
