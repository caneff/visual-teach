/* decision-trainer — wires .vt-trainer blocks.

   Markup contract (authored per lesson):
     <div class="vt-trainer">
       <div class="dt-scoreboard">… .tally span gets filled …</div>
       <div class="dt-scenario" data-answer="rebase">
         <span class="dt-tag">…</span>
         <p class="dt-q">…</p>
         <div class="dt-choices">
           <button class="dt-choice" data-choice="merge">Merge</button>
           <button class="dt-choice" data-choice="rebase">Rebase</button>
         </div>
         <div class="dt-explain"> … justification, .verdict span prepended … </div>
       </div>
       …
       <div class="dt-done">…</div>
     </div>

   On a click the chosen button is graded against data-answer, the correct
   button is highlighted, the explanation is revealed, and the scoreboard tally
   updates. Each scenario locks after its first answer so the score reflects a
   genuine first attempt. */

function wireTrainer(trainer) {
  var scenarios = Array.from(trainer.querySelectorAll(".dt-scenario"));
  if (scenarios.length === 0) return;

  var total = scenarios.length;
  var answered = 0;
  var correct = 0;
  var tally = trainer.querySelector(".dt-scoreboard .tally");

  function paintTally() {
    if (tally) tally.textContent = correct + " / " + answered + " right";
  }
  paintTally();

  scenarios.forEach(function (scn) {
    var answer = (scn.dataset.answer || "").trim();
    var buttons = Array.from(scn.querySelectorAll(".dt-choice"));
    var explain = scn.querySelector(".dt-explain");

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (scn.classList.contains("answered")) return;
        scn.classList.add("answered");

        var picked = (btn.dataset.choice || "").trim();
        var isRight = picked === answer;
        answered++;
        if (isRight) correct++;

        buttons.forEach(function (b) {
          b.disabled = true;
          if ((b.dataset.choice || "").trim() === answer) {
            b.classList.add("reveal-right");
          }
        });
        btn.classList.add(isRight ? "picked-right" : "picked-wrong");

        if (explain) {
          var verdict = document.createElement("span");
          verdict.className = "verdict " + (isRight ? "right" : "wrong");
          verdict.textContent = isRight
            ? "Right — "
            : "Not the safest call — ";
          explain.insertBefore(verdict, explain.firstChild);
        }

        paintTally();
        if (answered === total) trainer.classList.add("complete");
      });
    });
  });
}

if (typeof document !== "undefined") {
  var _doWireTrainers = function () {
    document.querySelectorAll(".vt-trainer").forEach(function (el) {
      try {
        wireTrainer(el);
      } catch (e) {
        console.warn("decision-trainer: failed to wire", e);
      }
    });
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", _doWireTrainers);
  } else {
    _doWireTrainers();
  }
}
