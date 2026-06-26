/* ============================================================================
   quiz.js — tiny reusable multiple-choice recall widget with immediate
   feedback. Shared across lessons. No dependencies.

   Usage: put a container with data-quiz and define questions in JS:
     mountQuiz(el, [
       { q: "…", choices: ["a","b","c"], answer: 1, why: "…" }, …
     ]);
   Choices for a given question are kept the same length where possible so
   formatting leaks no clue (per course pedagogy).
   ========================================================================== */
function mountQuiz(container, questions) {
  let i = 0, score = 0, answered = false;

  const qMeta = document.createElement("div"); qMeta.className = "q-meta";
  const qEl   = document.createElement("div"); qEl.className = "prompt";
  const choicesEl = document.createElement("div"); choicesEl.className = "choices";
  const fb    = document.createElement("div"); fb.className = "feedback";
  const foot  = document.createElement("div"); foot.className = "score";
  const next  = document.createElement("button"); next.className = "btn"; next.textContent = "Next →";
  next.style.display = "none";

  container.append(qMeta, qEl, choicesEl, fb, next, foot);

  function draw() {
    answered = false;
    const item = questions[i];
    qMeta.textContent = `Recall  ·  Question ${i + 1} of ${questions.length}`;
    qEl.textContent = item.q;
    choicesEl.innerHTML = "";
    fb.className = "feedback"; fb.textContent = "";
    next.style.display = "none";
    item.choices.forEach((c, idx) => {
      const b = document.createElement("button");
      b.className = "choice"; b.textContent = c;
      b.style.minWidth = "7rem";
      b.onclick = () => choose(idx, b, item);
      choicesEl.appendChild(b);
    });
    foot.textContent = `Score: ${score} / ${questions.length}`;
  }

  function choose(idx, btn, item) {
    if (answered) return;
    answered = true;
    [...choicesEl.children].forEach(c => c.disabled = true);
    if (idx === item.answer) {
      score++;
      btn.classList.add("correct");
      fb.className = "feedback good";
      fb.textContent = "✓ " + item.why;
    } else {
      btn.classList.add("wrong");
      choicesEl.children[item.answer].classList.add("correct");
      fb.className = "feedback bad";
      fb.textContent = "✗ " + item.why;
    }
    foot.textContent = `Score: ${score} / ${questions.length}`;
    if (i < questions.length - 1) {
      next.style.display = "inline-block";
    } else {
      next.textContent = "Restart";
      next.style.display = "inline-block";
      next.onclick = () => { i = 0; score = 0; next.textContent = "Next →"; next.onclick = advance; draw(); };
      return;
    }
    next.onclick = advance;
  }

  function advance() { i++; draw(); }
  draw();
}
