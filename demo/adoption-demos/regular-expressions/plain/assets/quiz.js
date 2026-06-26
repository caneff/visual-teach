/* ============================================================
   Regex course — shared interactive feedback components.
   Two reusable widgets used across every lesson:

   1. Multiple-choice quiz  (data-driven, immediate feedback)
   2. Write-the-pattern task (runs YOUR regex against sample
      strings live in the browser — the tightest feedback loop
      we can give: you see exactly what your pattern matches)

   No build step, no dependencies. Plain HTML data-attributes.
   ============================================================ */

/* ---------- 1. Multiple-choice quizzes ---------------------- */
/* Markup:
   <div class="quiz" data-correct="1">
     <p class="quiz-q">Question?</p>
     <ul class="choices">
       <li><button>answer a</button></li>
       <li><button>answer b</button></li>   // index 1 == correct
     </ul>
     <p class="verdict" data-ok="Why right." data-no="Nudge."></p>
   </div>
*/
document.querySelectorAll('.quiz').forEach(function (quiz) {
  var correct = parseInt(quiz.getAttribute('data-correct'), 10);
  var buttons = quiz.querySelectorAll('.choices button');
  var verdict = quiz.querySelector('.verdict');
  buttons.forEach(function (btn, i) {
    btn.addEventListener('click', function () {
      buttons.forEach(function (b, j) {
        b.disabled = true;
        if (j === correct) b.classList.add('correct');
      });
      if (i !== correct) btn.classList.add('wrong');
      if (verdict) {
        var ok = i === correct;
        verdict.textContent = (ok ? '✓ ' : '✗ ') +
          verdict.getAttribute(ok ? 'data-ok' : 'data-no');
        verdict.classList.add(ok ? 'ok' : 'no');
      }
    });
  });
});

/* ---------- 2. Write-the-pattern tasks ---------------------- */
/* Markup:
   <div class="task"
        data-flags="g"
        data-cases='[{"text":"abc","expect":"ab"}, ...]'>
     <label>Write a pattern that ...</label>
     <input type="text" placeholder="your regex here">
     <button class="check">Run it</button>
     <div class="result"></div>
     <p class="hintline">Hint: ...</p>
   </div>

   Each case: { text, expect } where `expect` is the exact substring
   the FIRST match should equal (or "" to assert no match).
   We build `new RegExp(input, flags)` and compare match[0] per case.
*/
document.querySelectorAll('.task').forEach(function (task) {
  var input   = task.querySelector('input[type="text"]');
  var button  = task.querySelector('button.check');
  var result  = task.querySelector('.result');
  var flags   = task.getAttribute('data-flags') || '';
  var cases;
  try { cases = JSON.parse(task.getAttribute('data-cases') || '[]'); }
  catch (e) { cases = []; }

  function esc(s) {
    return s.replace(/[&<>]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
    });
  }

  function run() {
    var src = input.value;
    if (!src) { result.innerHTML = ''; return; }
    var re;
    try { re = new RegExp(src, flags); }
    catch (err) {
      result.innerHTML = '<p class="verdict no">✗ Not a valid regex yet: ' +
        esc(err.message) + '</p>';
      return;
    }
    var rows = '', allPass = true;
    cases.forEach(function (c) {
      var nonGlobal = new RegExp(src, flags.replace('g', ''));
      var m = nonGlobal.exec(c.text);
      var got = m ? m[0] : null;
      var pass = (c.expect === '') ? (got === null) : (got === c.expect);
      if (!pass) allPass = false;

      var shown;
      if (got === null) {
        shown = '<span class="miss">(no match)</span>';
      } else {
        var start = m.index, end = start + got.length;
        shown = '<span class="miss">' + esc(c.text.slice(0, start)) + '</span>' +
                '<span class="hit">' + esc(got || '∅') + '</span>' +
                '<span class="miss">' + esc(c.text.slice(end)) + '</span>';
      }
      var want = c.expect === '' ? '(no match)' : '"' + esc(c.expect) + '"';
      rows += '<tr><td>' + (pass ? '✓' : '✗') + '</td>' +
              '<td class="mono">' + shown + '</td>' +
              '<td class="mono" style="color:var(--ink-soft)">want ' + want + '</td></tr>';
    });

    result.innerHTML =
      '<p class="verdict ' + (allPass ? 'ok' : 'no') + '">' +
        (allPass ? '✓ All cases pass — nicely done.'
                 : '✗ Not yet — see which rows fail below.') +
      '</p><table class="result-table"><tbody>' + rows + '</tbody></table>';
  }

  if (button) button.addEventListener('click', run);
  if (input) input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); run(); }
  });
});
