/* ============================================================================
   quiz.js — tiny reusable feedback-loop widgets for the course.
   Every lesson ends in a retrieval-practice loop; this is the shared engine.

   window.Quiz.mc(mount, opts)
     opts.choices : ["...", "..."]      (kept equal length per teach-base rule)
     opts.answer  : index of correct choice
     opts.explainRight / opts.explainWrong : feedback strings
     opts.onResult: function(correct) {}
   Renders buttons; on click locks in, colours right/wrong, shows explanation.

   window.Quiz.drill(mount, opts)  — endless self-checking drill
     opts.next()  : returns { promptHtml, choices:[...], answer, explain }
     opts.render(record) (optional) : called with the question record so the
                                       caller can draw a keyboard etc.
   Tracks a running streak/score so practice has immediate feedback + spacing.
   ============================================================================ */
(function () {
  "use strict";

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function mc(mount, opts) {
    if (typeof mount === "string") mount = document.querySelector(mount);
    mount.innerHTML = "";
    var box = el("div", "quiz-choices");
    var fb = el("div", "quiz-feedback");
    var answered = false;

    opts.choices.forEach(function (text, i) {
      var b = el("button", "quiz-choice", text);
      b.type = "button";
      b.addEventListener("click", function () {
        if (answered) return;
        answered = true;
        var correct = i === opts.answer;
        Array.prototype.forEach.call(box.children, function (c, j) {
          c.disabled = true;
          if (j === opts.answer) c.classList.add("right");
          else if (j === i) c.classList.add("wrong");
        });
        fb.className = "quiz-feedback show " + (correct ? "good" : "bad");
        fb.innerHTML = (correct ? "✓ " : "✗ ") +
          (correct ? (opts.explainRight || "Correct.")
                   : (opts.explainWrong || "Not quite."));
        if (opts.onResult) opts.onResult(correct);
      });
      box.appendChild(b);
    });
    mount.appendChild(box);
    mount.appendChild(fb);
  }

  function drill(mount, opts) {
    if (typeof mount === "string") mount = document.querySelector(mount);
    var score = 0, total = 0, streak = 0, best = 0;

    var head = el("div", "drill-head");
    var stage = el("div", "drill-stage");
    var prompt = el("div", "drill-prompt");
    var choices = el("div", "quiz-choices");
    var fb = el("div", "quiz-feedback");
    var nextBtn = el("button", "check", "Next question →");
    nextBtn.type = "button";
    nextBtn.style.display = "none";

    mount.innerHTML = "";
    mount.appendChild(head);
    stage.appendChild(prompt);
    mount.appendChild(stage);
    mount.appendChild(choices);
    mount.appendChild(fb);
    mount.appendChild(nextBtn);

    function paintHead() {
      head.innerHTML =
        '<span class="drill-score">Score <b>' + score + "/" + total + "</b></span>" +
        '<span class="drill-streak">Streak <b>' + streak + "</b>' +
        (best ? ' &middot; best ' + best : "") + "</span>";
    }

    function ask() {
      var q = opts.next();
      prompt.innerHTML = q.promptHtml || "";
      if (opts.render) opts.render(q, stage);
      fb.className = "quiz-feedback";
      fb.innerHTML = "";
      nextBtn.style.display = "none";
      choices.innerHTML = "";
      var answered = false;
      q.choices.forEach(function (text, i) {
        var b = el("button", "quiz-choice", text);
        b.type = "button";
        b.addEventListener("click", function () {
          if (answered) return;
          answered = true;
          total++;
          var correct = i === q.answer;
          if (correct) { score++; streak++; best = Math.max(best, streak); }
          else streak = 0;
          Array.prototype.forEach.call(choices.children, function (c, j) {
            c.disabled = true;
            if (j === q.answer) c.classList.add("right");
            else if (j === i) c.classList.add("wrong");
          });
          fb.className = "quiz-feedback show " + (correct ? "good" : "bad");
          fb.innerHTML = (correct ? "✓ " : "✗ ") + (q.explain || "");
          nextBtn.style.display = "inline-block";
          paintHead();
        });
        choices.appendChild(b);
      });
    }

    nextBtn.addEventListener("click", ask);
    paintHead();
    ask();
  }

  window.Quiz = { mc: mc, drill: drill };
})();
