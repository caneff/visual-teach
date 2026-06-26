# Shared spec — CSS flexbox

Identical for both arms (control = teach-base only; treatment = teach-base +
visual-teach available). Pins the mission and a fixed 3-lesson plan. Each arm
authors freely _within_ this plan; wording may diverge, the topic series is
fixed. This spec must never mention the visual layer.

## Mission

A developer can build pages but fights CSS layout. They reach for floats,
absolute positioning, and margin hacks to put things side by side, and still
can't reliably center a box or space a row of buttons evenly. Responsive rows
that reflow gracefully feel like luck. The goal: understand the flexbox model —
a container, one main axis, and items that distribute and align along it — well
enough to lay out a row or column on purpose, without guessing.

Auto-generated mission; the learner can edit it.

## Fixed lesson plan (exactly 3 lessons, in order)

1. **The container and its axis** — the smallest true mental model. Turning an
   element into a flex container (`display: flex`) makes its direct children
   flex items that lay out along a **main axis**; `flex-direction` (row/column)
   chooses that axis, and the **cross axis** is always perpendicular to it.
   Build the container → items → two-axes intuition; no distribution or sizing
   decisions yet.

2. **Distributing and aligning** — the workhorse skill. `justify-content`
   positions items along the main axis (start, end, center, space-between,
   space-around, space-evenly); `align-items` positions them on the cross axis
   (center is how you finally center a box); `gap` adds space between items.
   Centered on a recall/decision feedback loop: given a target layout, pick the
   properties.

3. **Flexible sizing** — applied practice toward the mission. How items share
   leftover space with the `flex` shorthand (`flex-grow` / `flex-shrink` /
   `flex-basis`), and how `flex-wrap` lets a row reflow onto multiple lines.
   Interleaves lessons 1 and 2 to build one responsive row (e.g. a nav bar or a
   card row) via a short applied checklist/workflow.

## Constraints

- Knows HTML and basic CSS (selectors, the box model, colors, fonts) but has no
  working flexbox model. Has only used floats / `position` / margins for layout.
- One tangible win per lesson; keep each short.
- Assume a modern browser; no vendor prefixes, no legacy fallbacks.
