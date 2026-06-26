/* teach-base quiz widget — vanilla JS, no dependencies */
(function () {
  "use strict";

  function initQuestion(el) {
    var correct = el.dataset.correct;
    var options = el.querySelectorAll(".quiz-options li");
    var explanation = el.querySelector(".quiz-explanation");
    var answered = false;

    options.forEach(function (opt) {
      opt.addEventListener("click", function () {
        if (answered) return;
        answered = true;

        options.forEach(function (o) {
          o.classList.add("answered");
        });

        if (opt.dataset.key === correct) {
          opt.classList.add("correct");
        } else {
          opt.classList.add("incorrect");
          options.forEach(function (o) {
            if (o.dataset.key === correct) {
              o.classList.add("revealed-correct");
            }
          });
        }

        if (explanation) {
          explanation.hidden = false;
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".quiz-question").forEach(initQuestion);
  });
})();
