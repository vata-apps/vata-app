---
name: design-system-standards
description: Conventions for vata-app's UI — when to reuse a shared primitive, when to compose inline, and when an application organism justifies a new internal component. Token-level customization rules and duplication/drift heuristics. Use when designing or reviewing UI under src/components/** or src/pages/**.
---

# Design System Standards — Vata

Vata's UI foundation is **Base UI** (`@base-ui/react`, behavior) + **Vanilla Extract** (`@vanilla-extract/css`, styling), per [ADR-005](../../../docs/adr/0005-headless-baseui-vanilla-extract.md). Full rationale, token list, and brand details live in [docs/ui/design-system.md](../../../docs/ui/design-system.md) — that doc is the source of truth; this skill only adds review/decision heuristics on top of it.

**Radix Themes still wraps unmigrated screens** during the screen-by-screen migration — check imports before applying either system's rules.

## Decision tree

For any UI element, take the first step that fits:

1. **Reuse a shared primitive from `src/components/ui/`** — the default for common interactive elements (`button`, `dialog`, `select`, `switch`, `table`, `text-field`, …). Each is a thin wrapper: a Base UI part, its states mapped to data attributes, styled from `vars.*`.
2. **Compose primitives inline** — a layout of known primitives (e.g. a header row of `Icon` + heading + button). Build it in the page or organism's own `.css.ts`, styled from `vars.*` — no new shared primitive for a one-off layout.
3. **Add a new shared primitive** in `src/components/ui/` — only when a Base UI part is needed on multiple screens and the styling belongs to the shared contract. Ships with its paired `.css.ts` in the same commit.
4. **Add an application organism** in `src/components/` (outside `ui/`) — for a component used across the app that composes primitives and adds applicative behavior (`tree-shell`, `tree-nav`, `dropzone`, `preferences-popover`, …). Never a restyled atom or molecule: reaching for a one-off styled button means stop and use the `button` primitive.

## Tokens

Every component derives its styling from `vars.*` — never a raw literal. Component anatomy — heights, padding, density — is authored once in the primitive's own `.css.ts`, never tuned per call site.

Reject in review:

- A raw color literal (`oklch()`, hex, `rgb()`) outside `theme.css.ts`.
- A new shared primitive whose styles aren't derived from `vars.*`.
- Component anatomy (padding/height/density) tuned per call site instead of in the primitive's stylesheet.

## Duplication

The same primitive composition repeated across ~3+ places is the signal to extract an application organism. Repetition inside one feature → a local helper in that feature directory. A one-off stays inline.

## Auditing

In audit mode, find: internal components with no importer (dead), pages still importing directly from `@radix-ui/themes` that may be ready to migrate, the drift patterns above, and compositions repeated enough to warrant an organism. Navigate and search the codebase yourself — these are simple greps.
