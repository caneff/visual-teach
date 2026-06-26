/* sequencer — course-specific interactive (not part of the vt library).

   Markup contract:
     <div class="vt-seq">
       <p class="vt-seq-prompt">…</p>
       <p class="vt-seq-sub">…</p>
       <div class="vt-seq-track"></div>
       <div class="vt-seq-bank">
         <button class="vt-seq-card" data-seq="1" data-carries="…">
           <span class="who">Client → Server</span>
           <span class="msg">ClientHello</span>
         </button>
         … more cards, any DOM order …
       </div>
       <div class="vt-seq-feedback" aria-live="polite"></div>
       <div class="vt-seq-done">Shown when fully ordered.</div>
     </div>

   Each card's data-seq is its correct 1-based position. The learner clicks
   cards in order; a correct pick moves into the track, a wrong pick shakes and
   is rejected. No external deps; plain IIFE like the vt component scripts. */
(function () {
  "use strict";

  function shuffle(nodes) {
    // Fisher-Yates over a copy, then re-append in the shuffled order.
    var arr = Array.prototype.slice.call(nodes);
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i];
      arr[i] = arr[j];
      arr[j] = t;
    }
    return arr;
  }

  function wire(seq) {
    var bank = seq.querySelector(".vt-seq-bank");
    var track = seq.querySelector(".vt-seq-track");
    var feedback = seq.querySelector(".vt-seq-feedback");
    if (!bank || !track) {
      console.warn("vt-seq: missing .vt-seq-bank or .vt-seq-track — left inert");
      return;
    }

    var cards = Array.prototype.slice.call(bank.querySelectorAll(".vt-seq-card"));
    var total = cards.length;
    var original = cards.slice(); // remember DOM order for reset

    function setFeedback(msg, cls) {
      if (!feedback) return;
      feedback.textContent = msg;
      feedback.className = "vt-seq-feedback" + (cls ? " " + cls : "");
    }

    var expected = 1;

    function reset() {
      expected = 1;
      seq.classList.remove("complete");
      setFeedback("", "");
      // restore every card to the bank in original order, stripped of state
      original.forEach(function (card) {
        card.classList.remove("placed", "wrong");
        var n = card.querySelector(".seq-n");
        if (n) n.remove();
        var c = card.querySelector(".carries");
        if (c) c.remove();
        bank.appendChild(card);
      });
      shuffle(bank.querySelectorAll(".vt-seq-card")).forEach(function (card) {
        bank.appendChild(card);
      });
    }

    function place(card) {
      card.classList.add("placed");
      // prepend the order number
      var n = document.createElement("span");
      n.className = "seq-n";
      n.textContent = card.dataset.seq;
      card.insertBefore(n, card.firstChild);
      // reveal what the message carries
      if (card.dataset.carries) {
        var c = document.createElement("span");
        c.className = "carries";
        c.textContent = card.dataset.carries;
        card.appendChild(c);
      }
      track.appendChild(card);
    }

    cards.forEach(function (card) {
      card.addEventListener("click", function () {
        if (card.classList.contains("placed")) return;
        var pos = parseInt(card.dataset.seq, 10);
        if (pos === expected) {
          place(card);
          expected++;
          if (expected > total) {
            seq.classList.add("complete");
            setFeedback("Correct — that's the full TLS 1.3 handshake. ✓", "ok");
          } else {
            setFeedback("Right — what comes next?", "ok");
          }
        } else {
          card.classList.add("wrong");
          var label = card.querySelector(".msg");
          setFeedback(
            (label ? label.textContent : "That message") +
              " can't go in position " + expected + " — something has to happen first.",
            "no"
          );
          setTimeout(function () {
            card.classList.remove("wrong");
          }, 350);
        }
      });
    });

    var resetBtn = seq.querySelector(".vt-seq-reset");
    if (resetBtn) resetBtn.addEventListener("click", reset);

    // initial shuffle so the answer isn't given by DOM order
    shuffle(bank.querySelectorAll(".vt-seq-card")).forEach(function (card) {
      bank.appendChild(card);
    });
  }

  function init() {
    document.querySelectorAll(".vt-seq").forEach(function (el) {
      try {
        wire(el);
      } catch (e) {
        console.warn("vt-seq: failed to wire", e);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
