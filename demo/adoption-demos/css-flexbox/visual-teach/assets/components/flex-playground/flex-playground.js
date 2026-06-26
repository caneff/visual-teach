/* flex-playground — wire each .vt-flexlab into a live flexbox container.

   Declarative markup, behaviour added here:

     <div class="vt-flexlab"
          data-controls="direction,justify,align,gap"  // container knobs to show
          data-items="3"                                // how many boxes
          data-labels="Logo,Links,Sign in"             // optional box labels
          data-show-axis                                // show main/cross axis readout
          data-item-flex                                // make boxes clickable to cycle flex-grow
          data-target="justify:center;align:center">    // optional challenge target
     </div>

   Everything inside is generated, so a lesson author writes one short div.
   No external state; nothing persisted. */

(function () {
  "use strict";

  // Each control: the CSS property it drives and the option values (CSS values).
  var CONTROLS = {
    direction: {
      prop: "flex-direction",
      options: ["row", "column"],
    },
    justify: {
      prop: "justify-content",
      options: [
        "flex-start",
        "center",
        "flex-end",
        "space-between",
        "space-around",
        "space-evenly",
      ],
    },
    align: {
      prop: "align-items",
      options: ["stretch", "flex-start", "center", "flex-end"],
    },
    wrap: {
      prop: "flex-wrap",
      options: ["nowrap", "wrap"],
    },
    gap: {
      prop: "gap",
      options: ["0px", "8px", "16px", "32px"],
    },
  };

  function parseTarget(str) {
    var t = {};
    if (!str) return t;
    str.split(";").forEach(function (pair) {
      var kv = pair.split(":");
      if (kv.length === 2) t[kv[0].trim()] = kv[1].trim();
    });
    return t;
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function wire(lab) {
    var keys = (lab.dataset.controls || "direction,justify,align,gap")
      .split(",")
      .map(function (s) {
        return s.trim();
      })
      .filter(function (k) {
        return CONTROLS[k];
      });

    var count = parseInt(lab.dataset.items, 10) || 3;
    var labels = (lab.dataset.labels || "")
      .split(",")
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean);
    var target = parseTarget(lab.dataset.target);
    var showAxis = lab.hasAttribute("data-show-axis");
    var itemFlex = lab.hasAttribute("data-item-flex");

    // current state — default to each control's first option
    var state = {};
    keys.forEach(function (k) {
      state[k] = CONTROLS[k].options[0];
    });
    var grow = []; // per-item flex-grow when itemFlex
    for (var g = 0; g < count; g++) grow.push(0);

    // ---- build challenge banner ----
    if (Object.keys(target).length) {
      var goal = el("div", "vt-flexlab-goal");
      var human = Object.keys(target).map(function (k) {
        return (CONTROLS[k] ? CONTROLS[k].prop : k) + ": " + target[k];
      });
      goal.innerHTML =
        "<strong>Challenge:</strong> set the controls so the rule reads " +
        human
          .map(function (h) {
            return "<code>" + h + "</code>";
          })
          .join(", ") +
        ".";
      lab.appendChild(goal);
    }

    // ---- controls ----
    var controlsWrap = el("div", "vt-flexlab-controls");
    var segButtons = {}; // key -> [buttons]
    keys.forEach(function (k) {
      var ctrl = el("div", "vt-flexlab-control");
      ctrl.appendChild(el("span", "lbl", CONTROLS[k].prop));
      var seg = el("div", "vt-flexlab-seg");
      segButtons[k] = [];
      CONTROLS[k].options.forEach(function (val) {
        var b = el("button", null, val);
        b.type = "button";
        b.setAttribute("aria-pressed", val === state[k] ? "true" : "false");
        b.addEventListener("click", function () {
          state[k] = val;
          render();
        });
        seg.appendChild(b);
        segButtons[k].push(b);
      });
      ctrl.appendChild(seg);
      controlsWrap.appendChild(ctrl);
    });
    lab.appendChild(controlsWrap);

    // ---- stage ----
    var stagewrap = el("div", "vt-flexlab-stagewrap");
    var axis;
    if (showAxis) {
      axis = el("div", "vt-flexlab-axis");
      stagewrap.appendChild(axis);
    }
    var stage = el("div", "vt-flexlab-stage");
    var boxes = [];
    var heightCycle = ["", "tall", "mid"]; // stagger so cross-axis alignment shows
    for (var i = 0; i < count; i++) {
      var box = el("div", "vt-flexlab-box " + heightCycle[i % heightCycle.length]);
      var labelText = labels[i] || String(i + 1);
      box.appendChild(document.createTextNode(labelText));
      if (itemFlex) {
        var badge = el("span", "vt-flexlab-grow", "flex-grow: 0");
        box.appendChild(badge);
        (function (idx, badgeRef) {
          box.addEventListener("click", function () {
            grow[idx] = (grow[idx] + 1) % 3; // 0 -> 1 -> 2 -> 0
            render();
          });
          box._badge = badgeRef;
        })(i, badge);
      }
      stage.appendChild(box);
      boxes.push(box);
    }
    stagewrap.appendChild(stage);
    lab.appendChild(stagewrap);

    // ---- foot: CSS readout + verdict/reset ----
    var foot = el("div", "vt-flexlab-foot");
    var css = el("pre", "vt-flexlab-css");
    foot.appendChild(css);

    var verdict;
    if (Object.keys(target).length) {
      verdict = el("div", "vt-flexlab-verdict");
      foot.appendChild(verdict);
    } else {
      var reset = el("button", "vt-flexlab-reset", "↺ reset");
      reset.type = "button";
      reset.addEventListener("click", function () {
        keys.forEach(function (k) {
          state[k] = CONTROLS[k].options[0];
        });
        for (var r = 0; r < count; r++) grow[r] = 0;
        render();
      });
      foot.appendChild(reset);
    }
    lab.appendChild(foot);

    // ---- render ----
    function render() {
      // apply to the live stage
      stage.style.display = "flex";
      keys.forEach(function (k) {
        stage.style.setProperty(CONTROLS[k].prop, state[k]);
      });
      if (itemFlex) {
        boxes.forEach(function (b, idx) {
          b.style.flexGrow = String(grow[idx]);
          if (b._badge) b._badge.textContent = "flex-grow: " + grow[idx];
        });
      }

      // segmented pressed-state
      keys.forEach(function (k) {
        segButtons[k].forEach(function (b) {
          b.setAttribute(
            "aria-pressed",
            b.textContent === state[k] ? "true" : "false"
          );
        });
      });

      // axis readout
      if (axis) {
        var col = state.direction === "column";
        axis.innerHTML =
          "main axis: <b>" +
          (col ? "vertical ↓" : "horizontal →") +
          "</b>" +
          "<span>cross axis: <b>" +
          (col ? "horizontal →" : "vertical ↓") +
          "</b></span>";
      }

      // CSS readout
      var lines = ["<span class='prop'>display</span>: flex;"];
      keys.forEach(function (k) {
        lines.push(
          "<span class='prop'>" + CONTROLS[k].prop + "</span>: " + state[k] + ";"
        );
      });
      var body = ".container {\n  " + lines.join("\n  ") + "\n}";
      if (itemFlex) {
        var itemLines = [];
        grow.forEach(function (gv, idx) {
          if (gv > 0)
            itemLines.push(
              "\n.item:nth-child(" +
                (idx + 1) +
                ") { <span class='prop'>flex-grow</span>: " +
                gv +
                "; }"
            );
        });
        body += itemLines.join("");
      }
      css.innerHTML = body;

      // challenge verdict
      if (verdict) {
        var matched = Object.keys(target).every(function (k) {
          return state[k] === target[k];
        });
        if (matched) {
          verdict.className = "vt-flexlab-verdict good";
          verdict.textContent = "Layout matches the target. That's the rule.";
        } else {
          var hits = Object.keys(target).filter(function (k) {
            return state[k] === target[k];
          }).length;
          verdict.className = "vt-flexlab-verdict close";
          verdict.textContent =
            hits +
            " of " +
            Object.keys(target).length +
            " properties match — keep adjusting.";
        }
      }
    }

    render();
  }

  function boot() {
    document.querySelectorAll(".vt-flexlab").forEach(function (lab) {
      try {
        wire(lab);
      } catch (e) {
        console.warn("visual-teach flex-playground: failed to wire", e);
      }
    });
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
  }

  if (typeof window !== "undefined") {
    window.vtFlexPlayground = { wire: wire };
  }
})();
