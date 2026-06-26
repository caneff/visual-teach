/* ============================================================================
   quiz.js — reusable retrieval-practice widget with immediate feedback.

   Markup contract:

     <div class="quiz" data-quiz>
       <p class="quiz-kicker">Recall</p>
       <div class="quiz-q">…question (may contain a <pre>)…</div>
       <div class="quiz-options">
         <button class="quiz-opt" data-correct>right answer</button>
         <button class="quiz-opt">distractor</button>
         …
       </div>
       <div class="quiz-feedback"
            data-ok="Shown on a correct pick."
            data-no="Shown on a wrong pick (the teaching moment)."></div>
     </div>

   On click: locks the buttons, marks the picked option correct/wrong, always
   reveals which option was right, and shows feedback. Retrieval first, then
   the explanation — that is what builds storage strength, not recognition.
   ========================================================================== */

(function () {
  function wire(quiz) {
    var opts = Array.prototype.slice.call(quiz.querySelectorAll(".quiz-opt"));
    var feedback = quiz.querySelector(".quiz-feedback");
    var answered = false;

    opts.forEach(function (opt) {
      opt.addEventListener("click", function () {
        if (answered) return;
        answered = true;
        var right = opt.hasAttribute("data-correct");

        opts.forEach(function (o) {
          o.disabled = true;
          if (o.hasAttribute("data-correct")) o.classList.add("correct");
        });
        if (!right) opt.classList.add("wrong");

        if (feedback) {
          feedback.classList.add("show", right ? "ok" : "no");
          var msg = right
            ? (feedback.getAttribute("data-ok") || "Correct.")
            : (feedback.getAttribute("data-no") || "Not quite.");
          feedback.innerHTML = (right ? "✓ " : "✗ ") + msg;
        }
      });
    });
  }

  function init() {
    document.querySelectorAll("[data-quiz]").forEach(wire);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
