# Tables, pills, and keyboard keys

## Table — `vt-table` or bare `<table>`

```html
<!-- Responsive wrapper (always use for .vt-table) -->
<div class="vt-table-wrap">
  <table class="vt-table">
    <!-- header column: th[scope="row"] on each data row -->
    <thead>
      <tr>
        <th>Capability</th>
        <th>Option A</th>
        <th>Option B</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th scope="row">Scales</th>
        <td class="vt-ok"></td>
        <td class="vt-no"></td>
      </tr>
      <tr class="vt-row-key">
        <th scope="row">Key row</th>
        <td class="vt-partial"></td>
        <td class="vt-ok"></td>
      </tr>
    </tbody>
  </table>
</div>
<!-- Compact density: add class="vt-table compact" -->
<!-- Cell status: td.vt-ok (✓)  td.vt-no (✗)  td.vt-partial (~) -->
<!-- Optional flavor under the icon: <td class="vt-no"><span class="note">rewrite the list</span></td> -->
<!-- Recommended column: <col class="vt-col-pick"> on the column + matching header
     <th class="vt-th-pick"><span class="vt-pick-badge">Recommended</span>Name</th>.
     Both classes required — col frames the sides, th closes the top. -->
```

Key/value reference table (glossary, config keys):

```html
<table class="vt-kv">
  <tr>
    <th scope="row">Term</th>
    <td>Definition</td>
  </tr>
</table>
```

## Pills, level badges, and keyboard keys

```html
<!-- Fills: (default accent)  neutral  good  bad  warn -->
<span class="vt-pill good">Done</span>
<!-- Outline: add class="outline" -->
<span class="vt-pill outline warn">Caution</span>
<!-- Size: add class="sm" -->
<!-- Status dot: add class="dot" -->
<span class="vt-pill outline good dot">Required</span>
<!-- Leading icon: add class="ic-check" or "ic-warn" -->
<span class="vt-pill good ic-check">Verified</span>

<!-- Step / count badge -->
<span class="vt-badge">3</span>

<!-- Keyboard keys -->
<kbd class="vt-kbd">Ctrl</kbd> + <kbd class="vt-kbd">K</kbd>
```
