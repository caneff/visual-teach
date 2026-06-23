# Teacher box

## `vt-teacher` — invite the learner to ask a question

**Discretionary.** Include a teacher prompt only when the lesson warrants it —
when there is a genuine point of confusion to surface, or a meaningful "go deeper"
invitation. Not every lesson needs one.

**Write it fresh each time.** Do not reuse a fixed heading or the same chips
lesson to lesson; identical teacher boxes are the #1 tell that a course was
stamped from a template. The cap icon and styling are supplied by the component
and stay consistent — your job is to vary the _words_.

Each lesson: write a one-line invitation in your own framing, and pull **2–4
chips from THIS lesson's actual content** — a real point of confusion here, a
link back to a prior lesson, a concrete "go deeper" on something specific. Vary
the chip count too; not every box needs exactly three.

```html
<div class="vt-teacher">
  <div>
    <p class="h">
      <!-- write a lesson-specific invitation — phrase it fresh, not a fixed string -->
    </p>
    <div class="vt-asks">
      <!-- 2–4 questions a learner of THIS lesson would genuinely ask -->
      <span class="vt-ask">…</span>
      <span class="vt-ask">…</span>
    </div>
  </div>
</div>
```

**Community pointer** — a source block (lives with external references):

```html
<div class="vt-source">
  <div>
    <span class="h">Practice with others</span><a href="#">community link</a>
  </div>
</div>
```
