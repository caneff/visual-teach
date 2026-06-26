/* ============================================================================
   Shared course behaviour — CSS Flexbox
   Three tiny, dependency-free widgets reused by every lesson:
     1. Multiple-choice recall quizzes with immediate feedback.
     2. Persisted applied checklists (survive a reload via localStorage).
     3. (styling-only widgets like <details> need no JS.)
   No build step; just <script src="../assets/lesson.js" defer></script>.
   ========================================================================== */
(function () {
  "use strict";

  /* ---- 1. Recall quizzes -------------------------------------------------
     Markup contract:
       <div class="quiz" data-answer="1">           // 0-based index of correct opt
         <p class="q-kicker">Recall</p>
         <p class="q-stem">…question…</p>
         <ul class="opts">
           <li><button class="opt">…</button></li>   // order = index
           …
         </ul>
         <div class="feedback"
              data-right="Shown when correct"
              data-wrong="Shown when wrong (the teaching moment)"></div>
       </div>
     One guess is graded; afterwards the correct option is always revealed so the
     lesson itself delivers the feedback even on a wrong first try. */
  function wireQuiz(quiz) {
    var answer = parseInt(quiz.getAttribute("data-answer"), 10);
    var opts = Array.prototype.slice.call(quiz.querySelectorAll(".opt"));
    var feedback = quiz.querySelector(".feedback");
    var answered = false;

    opts.forEach(function (opt, i) {
      opt.addEventListener("click", function () {
        if (answered) return;
        answered = true;
        var correct = i === answer;

        opts.forEach(function (o, j) {
          o.disabled = true;
          if (j === answer) o.classList.add("correct");
          else if (j === i) o.classList.add("wrong");
        });

        if (feedback) {
          var msg = correct
            ? (feedback.getAttribute("data-right") || "Correct.")
            : (feedback.getAttribute("data-wrong") || "Not quite.");
          feedback.innerHTML =
            '<span class="verdict">' +
            (correct ? "Correct ✓" : "Not quite —") +
            "</span> " + msg;
          feedback.classList.add("show", correct ? "right" : "miss");
        }
      });
    });
  }

  /* ---- 2. Persisted checklists ------------------------------------------
     Each <ul class="checklist" id="…"> with <li><input type="checkbox"> items
     remembers its ticks under a per-list localStorage key, so an applied
     workflow survives the reload between sitting down twice. */
  function wireChecklist(list) {
    var key = "flexbox:checklist:" + (list.id || "default");
    var boxes = Array.prototype.slice.call(list.querySelectorAll('input[type="checkbox"]'));
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(key) || "{}"); } catch (e) {}

    boxes.forEach(function (box, i) {
      var id = box.id || String(i);
      if (saved[id]) { box.checked = true; }
      reflect(box);
      box.addEventListener("change", function () {
        reflect(box);
        saved[id] = box.checked;
        try { localStorage.setItem(key, JSON.stringify(saved)); } catch (e) {}
      });
    });

    function reflect(box) {
      var li = box.closest("li");
      if (li) li.classList.toggle("done", box.checked);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".quiz").forEach(wireQuiz);
    document.querySelectorAll(".checklist").forEach(wireChecklist);
  });
})();
