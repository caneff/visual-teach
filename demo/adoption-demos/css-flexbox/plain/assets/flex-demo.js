/* ============================================================================
   flex-demo.js — reusable live flexbox playground.

   Markup contract (see any lesson for an example):

     <div class="demo" data-demo
          data-props="flex-direction:row, justify-content:flex-start, ...">
       <div class="demo-caption">…</div>
       <div class="demo-stage"> …items… </div>
       <div class="demo-controls"></div>     <!-- generated -->
       <div class="demo-code"></div>          <!-- generated -->
     </div>

   `data-props` is a comma-separated list of `property:initial` pairs. For each
   property a row of buttons is generated from a built-in value menu, the chosen
   value is applied live to the .demo-stage, and a CSS readout is kept in sync.
   This gives the tightest possible feedback loop: click a value, watch the
   boxes move, read the exact rule that did it.
   ========================================================================== */

(function () {
  // The candidate values offered for each flex property. Kept small and
  // mission-relevant so the learner explores, not drowns.
  var MENU = {
    "flex-direction":   ["row", "row-reverse", "column", "column-reverse"],
    "justify-content":  ["flex-start", "flex-end", "center",
                         "space-between", "space-around", "space-evenly"],
    "align-items":      ["stretch", "flex-start", "center", "flex-end", "baseline"],
    "flex-wrap":        ["nowrap", "wrap"],
    "gap":              ["0", "0.75rem", "1.5rem", "2.5rem"],
    "align-content":    ["stretch", "flex-start", "center", "space-between"]
  };

  function parseProps(str) {
    // "a:b, c:d" -> [["a","b"],["c","d"]]
    return (str || "").split(",").map(function (pair) {
      var i = pair.indexOf(":");
      return [pair.slice(0, i).trim(), pair.slice(i + 1).trim()];
    }).filter(function (p) { return p[0]; });
  }

  function render(demo) {
    var stage = demo.querySelector(".demo-stage");
    var controls = demo.querySelector(".demo-controls");
    var code = demo.querySelector(".demo-code");
    var state = {};
    parseProps(demo.getAttribute("data-props")).forEach(function (p) {
      state[p[0]] = p[1];
    });

    function apply() {
      Object.keys(state).forEach(function (prop) {
        stage.style.setProperty(prop, state[prop]);
      });
      // CSS readout
      var lines = ['<span class="ck">.container</span> {'];
      lines.push('  <span class="ck">display</span>: <span class="cv">flex</span>;');
      Object.keys(state).forEach(function (prop) {
        lines.push('  <span class="ck">' + prop + '</span>: ' +
                   '<span class="cv">' + state[prop] + '</span>;');
      });
      lines.push("}");
      code.innerHTML = lines.join("\n");
    }

    // build a button group per property
    Object.keys(state).forEach(function (prop) {
      var values = MENU[prop] || [state[prop]];
      var group = document.createElement("div");
      group.className = "demo-group";
      var label = document.createElement("div");
      label.className = "demo-group-label";
      label.textContent = prop;
      group.appendChild(label);
      var row = document.createElement("div");
      row.className = "demo-buttons";

      values.forEach(function (val) {
        var btn = document.createElement("button");
        btn.className = "demo-btn" + (val === state[prop] ? " active" : "");
        btn.textContent = val;
        btn.addEventListener("click", function () {
          state[prop] = val;
          row.querySelectorAll(".demo-btn").forEach(function (b) {
            b.classList.toggle("active", b === btn);
          });
          apply();
        });
        row.appendChild(btn);
      });
      group.appendChild(row);
      controls.appendChild(group);
    });

    apply();
  }

  function init() {
    document.querySelectorAll("[data-demo]").forEach(render);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
