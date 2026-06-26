/* ============================================================================
   Shared interactive components for "The TLS Handshake" course.
   Two feedback-loop widgets, both progressively-enhanced (work from markup):

     1. .quiz        — multiple-choice retrieval practice with instant feedback.
     2. .seq         — order-the-steps builder (click cards into sequence,
                       checked position-by-position) for the handshake recall.

   No dependencies. Each lesson links this file and supplies the data in markup.
   Styling hooks live in quiz.css (a sibling component).
   ============================================================================ */
(function () {
  "use strict";

  /* ---- 1. Multiple-choice recall ---------------------------------------- */
  function initQuiz(quiz) {
    var questions = quiz.querySelectorAll(".question");
    var scoreEl = quiz.querySelector(".quiz-score");
    var answered = 0, correctCount = 0;

    questions.forEach(function (q) {
      var choices = q.querySelectorAll(".choice");
      var feedback = q.querySelector(".feedback");
      var locked = false;

      choices.forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (locked) return;
          locked = true;
          answered++;
          var isCorrect = btn.dataset.correct === "true";
          if (isCorrect) correctCount++;

          choices.forEach(function (c) {
            c.disabled = true;
            if (c.dataset.correct === "true") c.classList.add("is-correct");
          });
          if (!isCorrect) btn.classList.add("is-wrong");

          if (feedback) {
            var why = (isCorrect ? btn.dataset.why : btn.dataset.why) ||
                      feedback.dataset.explain || "";
            feedback.innerHTML =
              '<span class="verdict ' + (isCorrect ? "ok" : "no") + '">' +
              (isCorrect ? "Correct" : "Not quite") + "</span> " + why;
            feedback.classList.add("shown");
          }
          if (scoreEl) {
            scoreEl.textContent =
              correctCount + " / " + questions.length + " recalled";
          }
        });
      });
    });
  }

  /* ---- 2. Order-the-steps builder --------------------------------------- */
  function initSeq(seq) {
    var pool = seq.querySelector(".seq-pool");
    var slotWrap = seq.querySelector(".seq-answer");
    var feedback = seq.querySelector(".seq-feedback");
    var resetBtn = seq.querySelector(".seq-reset");
    var cards = Array.prototype.slice.call(pool.querySelectorAll(".seq-card"));
    var placed = [];

    function render() {
      // pool shows only unplaced cards, in their (shuffled) DOM order
      cards.forEach(function (c) {
        c.style.display = placed.indexOf(c) === -1 ? "" : "none";
      });
      slotWrap.innerHTML = "";
      placed.forEach(function (c, i) {
        var slot = document.createElement("div");
        slot.className = "seq-slot";
        slot.innerHTML = '<span class="seq-num">' + (i + 1) + "</span>" +
                         '<span class="seq-label">' + c.textContent + "</span>";
        slot.addEventListener("click", function () {
          placed.splice(i, 1);
          feedback.classList.remove("shown");
          render();
        });
        slotWrap.appendChild(slot);
      });
      if (placed.length === cards.length) check();
    }

    function check() {
      var allRight = placed.every(function (c, i) {
        return parseInt(c.dataset.order, 10) === i + 1;
      });
      var firstWrong = -1;
      placed.forEach(function (c, i) {
        var ok = parseInt(c.dataset.order, 10) === i + 1;
        if (!ok && firstWrong === -1) firstWrong = i + 1;
      });
      feedback.classList.add("shown");
      if (allRight) {
        feedback.innerHTML =
          '<span class="verdict ok">Correct sequence</span> ' +
          (seq.dataset.win || "That is the TLS 1.3 flow.");
      } else {
        feedback.innerHTML =
          '<span class="verdict no">Not yet</span> Position ' + firstWrong +
          " is out of order. Click a card in the answer row to send it back, " +
          "then try again.";
      }
    }

    cards.forEach(function (c) {
      c.addEventListener("click", function () {
        if (placed.indexOf(c) !== -1) return;
        placed.push(c);
        feedback.classList.remove("shown");
        render();
      });
    });
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        placed = [];
        feedback.classList.remove("shown");
        feedback.innerHTML = "";
        render();
      });
    }
    render();
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".quiz").forEach(initQuiz);
    document.querySelectorAll(".seq").forEach(initSeq);
  });
})();
