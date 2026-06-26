/* ============================================================
   quiz.js — reusable retrieval-practice widget
   A tight feedback loop: the learner recalls an answer, clicks,
   and gets immediate automatic feedback. Shared by every lesson.

   Markup contract:
   <div class="quiz" data-answer="2">
     <div class="q-num">Recall</div>
     <p class="q-stem">Question text…</p>
     <ul class="options">
       <li><button class="opt">First answer</button></li>
       <li><button class="opt">Second answer</button></li>
       …
     </ul>
     <div class="feedback"
          data-right="Shown when correct."
          data-wrong="Shown when wrong.">
     </div>
   </div>

   data-answer is the zero-based index of the correct option.
   ============================================================ */
(function () {
  function wire(quiz) {
    var answer = parseInt(quiz.getAttribute('data-answer'), 10);
    var opts = Array.prototype.slice.call(quiz.querySelectorAll('button.opt'));
    var fb = quiz.querySelector('.feedback');
    var done = false;

    opts.forEach(function (btn, i) {
      btn.addEventListener('click', function () {
        if (done) return;
        done = true;
        var correct = i === answer;

        opts.forEach(function (b, j) {
          b.disabled = true;
          if (j === answer) b.classList.add('correct');
        });
        if (!correct) btn.classList.add('wrong');

        if (fb) {
          fb.classList.add('show', correct ? 'right' : 'nope');
          var msg = correct ? fb.getAttribute('data-right') : fb.getAttribute('data-wrong');
          fb.textContent = (correct ? '✓  ' : '✗  ') + (msg || '');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.quiz[data-answer]').forEach(wire);
  });
})();
