# Callouts and difficulty labels

## Callout — `vt-callout` (tone via class)

Default tone: `warn`. Other tones: `info` `insight` `success` `risk`

```html
<div class="vt-callout info"><strong>Note:</strong> …</div>
<div class="vt-callout insight"><strong>Why it matters:</strong> …</div>
<div class="vt-callout success"><strong>Done:</strong> …</div>
<div class="vt-callout risk"><strong>Caution:</strong> …</div>
<div class="vt-callout warn"><strong>Warning:</strong> …</div>
```

Self-explanation prompt (reach for mid-lesson, not just at the end):

```html
<div class="vt-callout insight">
  <strong>Try this:</strong> explain [concept] back to me in your own words —
  I'll tell you what you missed.
</div>
```

## Difficulty pill — `vt-level` (use inside `.vt-metabar` or standalone)

Modifier classes: `beginner` `intermediate` `advanced`

```html
<span class="vt-level beginner">Beginner</span>
<span class="vt-level intermediate">Intermediate</span>
<span class="vt-level advanced">Advanced</span>
```
