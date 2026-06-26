/* ============================================================================
   quiz.js — shared interactive feedback loop for the Bayes' theorem course.

   Two widgets, both progressive-enhancement (work from plain HTML, no build):

   1. Multiple choice .quiz
        <div class="quiz" data-answer="b">
          <p class="q">Question?</p>
          <div class="options">
            <button class="opt" data-key="a">First</button>
            <button class="opt" data-key="b">Second</button>
          </div>
          <div class="feedback" data-for="a">Why a is wrong.</div>
          <div class="feedback" data-for="b">Why b is right.</div>
          <div class="feedback" data-for="*">Generic fallback.</div>
        </div>
      Immediate, automatic feedback on click; colours the chosen option and
      reveals the matching explanation. This is the tight loop the pedagogy asks
      for — recall, answer, correction, in one motion.

   2. Reveal-on-demand .reveal — for "work it yourself, then check" numeric
      problems where there is no fixed option set.
        <div class="reveal">
          <button>Show the worked answer</button>
          <div class="answer"> … </div>
        </div>
      The point is desirable difficulty: the learner must commit to a number
      before the answer appears.
   ========================================================================== */

(function () {
  "use strict";

  function wireQuiz(quiz) {
    var answer = quiz.getAttribute("data-answer");
    var options = quiz.querySelectorAll("button.opt");
    var feedbacks = quiz.querySelectorAll(".feedback");

    options.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-key");
        var right = key === answer;

        // lock the widget — one honest attempt
        options.forEach(function (b) {
          b.disabled = true;
          var bkey = b.getAttribute("data-key");
          if (bkey === answer) b.classList.add("correct");
          if (bkey === key && !right) b.classList.add("wrong");
        });

        // show the most specific feedback we have for this choice
        var shown = null;
        feedbacks.forEach(function (f) {
          if (f.getAttribute("data-for") === key) shown = f;
        });
        if (!shown) {
          feedbacks.forEach(function (f) {
            if (f.getAttribute("data-for") === "*") shown = f;
          });
        }
        feedbacks.forEach(function (f) {
          f.classList.remove("show", "right", "nope");
        });
        if (shown) {
          shown.classList.add("show", right ? "right" : "nope");
        }
      });
    });
  }

  function wireReveal(reveal) {
    var btn = reveal.querySelector("button");
    if (!btn) return;
    btn.addEventListener("click", function () {
      reveal.classList.add("open");
    });
  }

  function init() {
    document.querySelectorAll(".quiz[data-answer]").forEach(wireQuiz);
    document.querySelectorAll(".reveal").forEach(wireReveal);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
