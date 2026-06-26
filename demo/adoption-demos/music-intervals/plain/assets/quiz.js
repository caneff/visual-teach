/* ============================================================================
   quiz.js — reusable self-check feedback loop for lessons.
   No dependencies, no network. Drop a <div class="quiz"> with one or more
   <div class="q"> blocks. Each .q has:
     - a .prompt
     - an .opts container of <button class="opt"> ; mark the right one
       with data-correct="1"
     - an optional .feedback element whose data-ok / data-no text is shown
   The script wires click handling, locks the question after the first
   answer, colours the choice, reveals feedback, and tallies a score.
   ========================================================================== */
(function () {
  "use strict";

  function wireQuestion(q, onAnswered) {
    var opts = Array.prototype.slice.call(q.querySelectorAll(".opt"));
    var fb = q.querySelector(".feedback");
    var answered = false;

    opts.forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (answered) return;
        answered = true;
        var correct = btn.getAttribute("data-correct") === "1";

        opts.forEach(function (b) {
          b.disabled = true;
          if (b.getAttribute("data-correct") === "1") b.classList.add("correct");
        });
        if (!correct) btn.classList.add("wrong");

        if (fb) {
          fb.classList.add("show", correct ? "ok" : "no");
          var msg = fb.getAttribute(correct ? "data-ok" : "data-no");
          if (msg) fb.innerHTML = (correct ? "✓ " : "✗ ") + msg;
        }
        onAnswered(correct);
      });
    });
  }

  function init() {
    document.querySelectorAll(".quiz").forEach(function (quiz) {
      var qs = Array.prototype.slice.call(quiz.querySelectorAll(".q"));
      var total = qs.length;
      var done = 0, right = 0;
      var score = quiz.querySelector(".scoreline");

      function update() {
        if (!score) return;
        score.textContent =
          "Answered " + done + " / " + total + "  ·  " +
          right + " correct";
      }
      update();

      qs.forEach(function (q) {
        wireQuestion(q, function (correct) {
          done++; if (correct) right++;
          update();
          if (done === total && score) {
            score.textContent +=
              right === total
                ? "  — perfect. The pattern is in your hands now."
                : "  — revisit the misses, then try once more.";
          }
        });
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
