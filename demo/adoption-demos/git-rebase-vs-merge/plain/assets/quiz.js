/* ============================================================
   quiz.js — reusable recall/decision feedback widget.
   Zero dependencies. Progressive enhancement: markup is readable
   without JS; this wires up immediate, automatic feedback.

   Markup contract:
     <div class="quiz" data-quiz>
       <p class="q-prompt">Question?</p>
       <p class="q-scenario">Optional scenario text.</p>
       <ul class="opts">
         <li><button class="opt" data-correct
                 data-feedback="Why this is right.">Answer A</button></li>
         <li><button class="opt"
                 data-feedback="Why this is wrong.">Answer B</button></li>
       </ul>
       <div class="feedback"></div>
     </div>

   - Mark the correct option(s) with the `data-correct` attribute.
   - Each option may carry its own `data-feedback` explanation.
   - On click: colours the chosen option, reveals the correct one,
     prints feedback, and locks the question (retrieval, then truth).
   ============================================================ */
(function () {
  "use strict";

  function wire(quiz) {
    var opts = Array.prototype.slice.call(quiz.querySelectorAll(".opt"));
    var feedback = quiz.querySelector(".feedback");

    opts.forEach(function (opt) {
      opt.addEventListener("click", function () {
        if (quiz.dataset.answered) return;
        quiz.dataset.answered = "true";

        var chosenCorrect = opt.hasAttribute("data-correct");

        opts.forEach(function (o) {
          o.disabled = true;
          if (o.hasAttribute("data-correct")) o.classList.add("correct");
        });
        if (!chosenCorrect) opt.classList.add("wrong");

        if (feedback) {
          var own = opt.getAttribute("data-feedback");
          var lead = chosenCorrect ? "Correct. " : "Not quite. ";
          feedback.textContent = lead + (own || "");
          feedback.classList.add("show", chosenCorrect ? "ok" : "no");
        }
      });
    });
  }

  function init() {
    var quizzes = document.querySelectorAll("[data-quiz]");
    Array.prototype.forEach.call(quizzes, wire);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
