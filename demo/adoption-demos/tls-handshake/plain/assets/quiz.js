/* ============================================================================
   quiz.js — reusable recall/practice widgets for the TLS course.
   No dependencies. Lessons declare questions in HTML data-* attributes or via
   small inline config objects; this file wires up the feedback loop.

   Three widgets, each built around an immediate, automatic feedback loop:

   1. [data-quiz]            multiple-choice recall. Reveals correct/incorrect
                            instantly, with an explanation. Answers should be
                            equal length (the lesson's job, not enforced here).
   2. [data-order]          drag-free sequence ordering (click up/down). Used in
                            lesson 2 to order the handshake messages.
   3. [data-flip]           self-graded flashcard (click to reveal). Storage-
                            strength retrieval; honour system.

   All widgets keep a tiny tally and print a one-line score so the learner gets
   a sense of progress within the lesson.
   ========================================================================== */

(function () {
  "use strict";

  /* ---- 1. Multiple-choice recall --------------------------------------- */
  // Markup:
  // <div data-quiz>
  //   <p class="q">Question text…</p>
  //   <button data-correct>Right answer</button>
  //   <button>Wrong answer</button>
  //   <div class="why" hidden>Explanation shown after answering.</div>
  // </div>
  function initQuiz(root) {
    var buttons = Array.prototype.slice.call(root.querySelectorAll("button"));
    var why = root.querySelector(".why");
    var answered = false;

    buttons.forEach(function (btn) {
      btn.classList.add("quiz-opt");
      btn.addEventListener("click", function () {
        if (answered) return;
        answered = true;
        var correct = btn.hasAttribute("data-correct");
        buttons.forEach(function (b) {
          b.disabled = true;
          if (b.hasAttribute("data-correct")) b.classList.add("opt-correct");
        });
        if (!correct) btn.classList.add("opt-wrong");
        if (why) why.hidden = false;
        root.dispatchEvent(new CustomEvent("quiz:answered",
          { bubbles: true, detail: { correct: correct } }));
      });
    });
  }

  /* ---- 2. Sequence ordering -------------------------------------------- */
  // Markup:
  // <div data-order>
  //   <ol class="order-list">
  //     <li data-pos="2">Second item…</li>  (rendered shuffled by author)
  //     <li data-pos="1">First item…</li>
  //   </ol>
  //   <button class="order-check">Check order</button>
  //   <p class="order-result" hidden></p>
  // </div>
  function initOrder(root) {
    var list = root.querySelector(".order-list");
    var items = Array.prototype.slice.call(list.children);
    var result = root.querySelector(".order-result");

    items.forEach(function (li) {
      var ctrl = document.createElement("span");
      ctrl.className = "order-ctrl";
      var up = document.createElement("button");
      up.type = "button"; up.textContent = "▲"; up.title = "move up";
      var down = document.createElement("button");
      down.type = "button"; down.textContent = "▼"; down.title = "move down";
      up.addEventListener("click", function () {
        if (li.previousElementSibling)
          list.insertBefore(li, li.previousElementSibling);
      });
      down.addEventListener("click", function () {
        if (li.nextElementSibling)
          list.insertBefore(li.nextElementSibling, li);
      });
      ctrl.appendChild(up); ctrl.appendChild(down);
      li.insertBefore(ctrl, li.firstChild);
    });

    root.querySelector(".order-check").addEventListener("click", function () {
      var now = Array.prototype.slice.call(list.children);
      var ok = now.every(function (li, i) {
        return parseInt(li.getAttribute("data-pos"), 10) === i + 1;
      });
      now.forEach(function (li, i) {
        li.classList.remove("pos-ok", "pos-no");
        var right = parseInt(li.getAttribute("data-pos"), 10) === i + 1;
        li.classList.add(right ? "pos-ok" : "pos-no");
      });
      result.hidden = false;
      result.textContent = ok
        ? "✓ Correct — that is the TLS 1.3 message order."
        : "Not yet. Items in red are out of place — read the hint and try again.";
      result.className = "order-result " + (ok ? "is-ok" : "is-no");
    });
  }

  /* ---- 3. Flashcard flip ----------------------------------------------- */
  // Markup:
  // <div data-flip>
  //   <div class="flip-front">Prompt…</div>
  //   <div class="flip-back" hidden>Answer…</div>
  // </div>
  function initFlip(root) {
    var back = root.querySelector(".flip-back");
    var hint = document.createElement("div");
    hint.className = "flip-hint";
    hint.textContent = "Think, then click to reveal ▸";
    root.insertBefore(hint, root.firstChild);
    root.addEventListener("click", function () {
      var show = back.hidden;
      back.hidden = !show;
      hint.textContent = show
        ? "Click to hide ▾"
        : "Think, then click to reveal ▸";
    });
  }

  /* ---- Score tally ------------------------------------------------------ */
  function initScore() {
    var bars = document.querySelectorAll("[data-score]");
    if (!bars.length) return;
    var total = document.querySelectorAll("[data-quiz]").length;
    var right = 0, done = 0;
    document.addEventListener("quiz:answered", function (e) {
      done += 1;
      if (e.detail.correct) right += 1;
      bars.forEach(function (b) {
        b.textContent = "Recall so far: " + right + " / " + done +
          (done === total ? " — deck complete." : "");
      });
    });
  }

  /* ---- Boot ------------------------------------------------------------- */
  function boot() {
    document.querySelectorAll("[data-quiz]").forEach(initQuiz);
    document.querySelectorAll("[data-order]").forEach(initOrder);
    document.querySelectorAll("[data-flip]").forEach(initFlip);
    initScore();
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
