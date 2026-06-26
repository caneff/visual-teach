/* ============================================================
   playground.js — reusable live flexbox playground
   The tightest feedback loop in the course: change a property,
   watch the boxes move, and read the exact CSS being applied.

   Markup contract:
   <div class="pg"
        data-controls="flex-direction,justify-content,align-items,gap"
        data-boxes="3">
   </div>

   data-controls : comma-separated property names to expose
   data-boxes    : how many boxes to render (default 3)
   data-tall     : "true" to make box #2 taller (shows cross-axis)
   ============================================================ */
(function () {
  var CHOICES = {
    'flex-direction':  ['row', 'row-reverse', 'column', 'column-reverse'],
    'justify-content': ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'],
    'align-items':     ['stretch', 'flex-start', 'flex-end', 'center', 'baseline'],
    'flex-wrap':       ['nowrap', 'wrap', 'wrap-reverse'],
    'gap':             ['0px', '8px', '16px', '32px']
  };

  function build(pg) {
    var controls = (pg.getAttribute('data-controls') || 'justify-content,align-items')
      .split(',').map(function (s) { return s.trim(); });
    var n = parseInt(pg.getAttribute('data-boxes') || '3', 10);
    var tall = pg.getAttribute('data-tall') === 'true';

    var stage = document.createElement('div');
    stage.className = 'stage';
    for (var i = 1; i <= n; i++) {
      var b = document.createElement('div');
      b.className = 'box' + (tall && i === 2 ? ' tall' : '');
      b.textContent = i;
      stage.appendChild(b);
    }

    var bar = document.createElement('div');
    bar.className = 'controls';
    var readout = document.createElement('div');
    readout.className = 'readout';

    var state = {};
    controls.forEach(function (prop) {
      var values = CHOICES[prop] || [];
      state[prop] = values[0];
      var label = document.createElement('label');
      label.textContent = prop;
      var sel = document.createElement('select');
      values.forEach(function (v) {
        var o = document.createElement('option');
        o.value = v; o.textContent = v; sel.appendChild(o);
      });
      sel.addEventListener('change', function () {
        state[prop] = sel.value; apply();
      });
      label.appendChild(sel);
      bar.appendChild(label);
    });

    function apply() {
      controls.forEach(function (prop) { stage.style[prop] = state[prop]; });
      // height only matters when align-items is exposed
      stage.style.minHeight = controls.indexOf('align-items') > -1 ? '160px' : '';
      var css = 'display: flex;\n';
      controls.forEach(function (prop) { css += prop + ': ' + state[prop] + ';\n'; });
      readout.innerHTML = css.replace(/^(.*?):/gm, '<b>$1</b>:');
    }

    pg.appendChild(stage);
    pg.appendChild(bar);
    pg.appendChild(readout);
    apply();
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.pg[data-controls], .pg:not([data-controls])').forEach(build);
  });
})();
