# Shared spec — regular expressions

Identical for both arms (control = teach-base only; treatment = teach-base +
visual-teach available). Pins the mission and a fixed 3-lesson plan. Each arm
authors freely _within_ this plan; wording may diverge, the topic series is
fixed. This spec must never mention the visual layer.

## Mission

A working developer uses regular expressions by copy-paste — grabbing patterns
off Stack Overflow, tweaking blindly, and hoping. They can't read an unfamiliar
regex, can't write one from scratch, and can't tell why a pattern matches too
much or too little. The goal: build a real mental model of how a regex engine
scans text and what each piece of syntax does, enough to read a moderate pattern
and write one for a concrete matching task without trial and error.

Auto-generated mission; the learner can edit it.

## Fixed lesson plan (exactly 3 lessons, in order)

1. **Literals and character classes** — the smallest true mental model. A regex
   is a pattern the engine tries to match against text, scanning left to right.
   Literal characters match themselves; `.` matches any character; a character
   class `[...]` matches one character from a set (and `[^...]` one not in it);
   the shorthands `\d \w \s` (and their negations). Build the "match one
   position at a time" intuition; quantifiers come next.

2. **Quantifiers and anchors** — the core skill. How many times: `*` `+` `?` and
   `{n}` / `{n,m}`; greedy vs. lazy (`.*` vs. `.*?`) and why greedy "matches too
   much." Anchors that match a position rather than a character: `^` `$` and word
   boundary `\b`. Centered on a recall/decision feedback loop: given a target
   string and goal, write the pattern.

3. **Groups, alternation, and capture — applied** — applied practice toward the
   mission. Grouping with `(...)`, alternation `|`, and capturing vs.
   non-capturing groups; using captures to extract parts of a match. Interleaves
   lessons 1–2 into one real task — validate or extract from a concrete string
   (e.g. pull the fields out of a log line) — via a short applied checklist.

## Constraints

- Comfortable programming in at least one language and has seen regexes in the
  wild (search-and-replace, a validation snippet) but has no working model of
  the syntax. Has never written a non-trivial pattern unaided.
- Use a common, portable flavor (PCRE/JavaScript-style); avoid language-specific
  exotica and lookaround — keep to the core listed above.
- Show patterns against concrete sample strings; make matching visible.
- One tangible win per lesson; keep each short.
