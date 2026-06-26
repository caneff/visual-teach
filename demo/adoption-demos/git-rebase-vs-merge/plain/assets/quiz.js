/* Shared quiz widget — works across all lessons in this course.
 *
 * Markup contract:
 *   .quiz-question           wrapper for one question
 *     p                      the question text
 *     .quiz-options          button container
 *       button.quiz-option   each option; data-correct="true" marks the answer
 *     .quiz-feedback         explanation shown after answering
 */
(function () {
  "use strict";

  function initQuiz() {
    document.querySelectorAll(".quiz-question").forEach(function (block) {
      var options = block.querySelectorAll(".quiz-option");

      options.forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (block.dataset.answered) return;
          block.dataset.answered = "1";

          var isCorrect = btn.dataset.correct === "true";
          var feedback = block.querySelector(".quiz-feedback");

          options.forEach(function (opt) {
            opt.disabled = true;
            if (opt.dataset.correct === "true") {
              opt.classList.add("correct");
            } else if (opt === btn && !isCorrect) {
              opt.classList.add("incorrect");
            }
          });

          if (feedback) {
            feedback.classList.add("visible");
          }
        });
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initQuiz);
  } else {
    initQuiz();
  }
})();
