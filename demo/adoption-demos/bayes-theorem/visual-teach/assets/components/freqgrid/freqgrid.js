/* freqgrid — natural-frequency icon array.
   Markup:

   <div class="vt-freqgrid" data-cols="100"
        data-groups='[{"n":10,"cls":"tp","label":"have it & test positive"},
                      {"n":100,"cls":"fp","label":"healthy but test positive"}]'
        data-caption="Each square is one person out of 10,000.">
   </div>

   The total number of cells is data-total (defaults to cols*cols, i.e. a square
   grid). Cells are colored group-by-group from the front; everything past the
   listed groups stays the default "rest" tint. A legend is generated from the
   group labels, with the "rest" count appended automatically. Self-contained. */

(function () {
  var CLS_LABEL = { tp: "tp", fp: "fp", sick: "sick" };

  function wire(block) {
    var cols = parseInt(block.dataset.cols, 10) || 100;
    var total = parseInt(block.dataset.total, 10) || cols * cols;
    var groups;
    try {
      groups = JSON.parse(block.dataset.groups || "[]");
    } catch (e) {
      console.warn("visual-teach: vt-freqgrid bad data-groups JSON — inert", e);
      return;
    }

    var grid = document.createElement("div");
    grid.className = "fg-grid";
    grid.style.gridTemplateColumns = "repeat(" + cols + ", 1fr)";

    // Flatten groups into a per-cell class list, front-loaded.
    var classes = [];
    groups.forEach(function (g) {
      var c = CLS_LABEL[g.cls] || "";
      for (var i = 0; i < g.n; i++) classes.push(c);
    });

    var frag = document.createDocumentFragment();
    for (var i = 0; i < total; i++) {
      var cell = document.createElement("div");
      cell.className = "fg-cell" + (classes[i] ? " " + classes[i] : "");
      frag.appendChild(cell);
    }
    grid.appendChild(frag);
    block.appendChild(grid);

    // Legend, including an auto "rest" entry for the uncolored remainder.
    var used = classes.length;
    var legend = document.createElement("div");
    legend.className = "fg-legend";
    var html = "";
    groups.forEach(function (g) {
      var c = CLS_LABEL[g.cls] || "rest";
      html +=
        '<span class="key"><span class="sw ' +
        c +
        '"></span>' +
        g.label +
        " — " +
        g.n.toLocaleString() +
        "</span>";
    });
    if (total - used > 0) {
      html +=
        '<span class="key"><span class="sw rest"></span>everyone else — ' +
        (total - used).toLocaleString() +
        "</span>";
    }
    legend.innerHTML = html;
    block.appendChild(legend);

    if (block.dataset.caption) {
      var cap = document.createElement("p");
      cap.className = "fg-caption";
      cap.textContent = block.dataset.caption;
      block.appendChild(cap);
    }
  }

  function init() {
    document.querySelectorAll(".vt-freqgrid").forEach(wire);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
