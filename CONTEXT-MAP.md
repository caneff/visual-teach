# Context Map

## Contexts

- [visual-teach](./CONTEXT.md) — the passive component library + `/teach` add-on
  skill that ships the lessons' look and interactive behavior. Decisions in
  [`docs/adr/`](./docs/adr/).
- [Sandcastle orchestrator](./.sandcastle/CONTEXT.md) — the dev-automation loop
  that builds open issues into PRs. Decisions in
  [`.sandcastle/docs/adr/`](./.sandcastle/docs/adr/).

## Relationships

- **Sandcastle → visual-teach**: the orchestrator is tooling that *builds*
  visual-teach; it has no runtime relationship with the library and shares no
  vocabulary. Kept as a separate context so its terms (run, forest, component,
  topic group) don't leak into the library glossary.
