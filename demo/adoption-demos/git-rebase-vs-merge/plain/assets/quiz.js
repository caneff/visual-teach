/* quiz.js — shared interactive recall component for the course.
   A lesson marks up a multiple-choice question declaratively; this wires the
   immediate-feedback loop. No build step, no dependencies.

   Markup contract:
     <div class="quiz" data-quiz>
       <p class="q">Question text</p>
       <button class="opt" data-correct>Right answer</button>
       <button class="opt">Wrong answer</button>
       <div class="feedback" data-when="right">Shown on a correct pick…</div>
       <div class="feedback" data-when="wrong">Shown on a wrong pick…</div>
     </div>

   Put the explanation in the data-when="right" block so the learner always
   ends on the reasoning, however they answered. */

document.addEventListener("click", function (e) {
  var btn = e.target.closest(".quiz [data-quiz] .opt, .quiz .opt");
  if (!btn) return;
  var quiz = btn.closest(".quiz");
  if (!quiz || quiz.dataset.answered) return;

  var correct = btn.hasAttribute("data-correct");

  // Lock the quiz and reveal the truth on every option.
  quiz.dataset.answered = "true";
  quiz.querySelectorAll(".opt").forEach(function (b) {
    b.disabled = true;
    if (b.hasAttribute("data-correct")) b.classList.add("correct");
    else if (b === btn) b.classList.add("incorrect");
  });

  var rightFb = quiz.querySelector('.feedback[data-when="right"]');
  var wrongFb = quiz.querySelector('.feedback[data-when="wrong"]');

  // Always show the reasoning (the "right" block). On a miss, also show the
  // short corrective note first.
  if (!correct && wrongFb) wrongFb.classList.add("show", "wrong");
  if (rightFb) rightFb.classList.add("show", correct ? "right" : "wrong");
});
