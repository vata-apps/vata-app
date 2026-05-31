# ADR-010: Pure Radix Themes — Drop Brand Palette, Custom Fonts, Motion, and Scoped CSS

**Status**: Accepted
**Date**: 2026-05-31

## Context

[ADR-007](./0007-adopt-radix-themes.md) adopted Radix Themes as the UI foundation but deliberately preserved three brand affordances: the self-hosted **Geist/Fraunces/Geist Mono** fonts, a custom **terracotta accent + sand gray** palette, and **scoped local CSS as an escape hatch** for "genuinely bespoke surfaces." In practice `app.css` grew back to 431 lines — a full 12-step custom oklch palette (light + dark), `@font-face` blocks, and per-component decoration (card hover-lift, the CTA dashed-ring halo) — plus five component-scoped `.css` files. The escape hatch became the drift vector ADR-007 set out to close.

A pure-`@radix-ui/themes` proof of concept (the `/home-radix` and person-overview-radix experiments) confirmed the app reads well with **stock Radix components and nothing else** — no custom CSS, no brand palette, no custom fonts, no motion.

## Decision

Every styling decision is made by Radix Themes. The app uses **direct Radix Themes components only**, with no hand-authored visual CSS anywhere.

- **No custom CSS.** `app.css` reduces to `@import '@radix-ui/themes/styles.css'` plus a 4-line root reset (`html, body, #root { height: 100% }`, `body { margin: 0 }`) — the one sanctioned exception, because Radix cannot size `html`/`body`. Every other `.css` file is deleted.
- **No brand palette.** Radix defaults — **indigo accent, default gray**. The custom oklch scales are removed; no `accentColor`/`grayColor` override.
- **No custom fonts.** The Geist/Fraunces/Geist Mono `@font-face` blocks and font-family overrides are removed; all three roles fall to Radix's built-in **system stacks**. Serif (Fraunces) headings are gone.
- **No custom motion.** All `transition`/`transform`/`@keyframes` and `prefers-reduced-motion` handling are deleted. Only Radix components' own built-in interaction states remain.
- **Enforceable boundary:** Radix Themes component props only. **`style={{}}` escapes and raw `var(--…)` token references are banned** (grep-gated). String-valued Radix dimension props (`minHeight="240px"`, `flexGrow="1"`) are allowed — they are the Radix API.
- **Components:** purely presentational wrappers (`tree-card`, `tree-card-cta`, `tree-section-divider`, `app-status-bar`) are deleted and inlined at their call sites. Structural/stateful organisms (`tree-shell`, `tree-nav`, `entity-list-panel`, `dropzone`, the tree modals, `preferences-popover`) survive as files but are purified.
- **Re-express, don't delete.** Features are rebuilt from Radix components. A feature is dropped only when it is a visual flourish Radix cannot express (gradient backgrounds, the gradient divider, decorative motion, the dashed CTA ring, tabular-mono alignment).

### Carve-outs

- **The Lucide icon registry (`src/components/icon.tsx`) is kept** — icon governance, not styling, exactly as ADR-007 framed it. `@radix-ui/react-icons` is not adopted.
- **The four entity sidebars** are purified on a best-effort, low-investment basis only; they are scheduled for removal when the new entity page lands.

## Why

- **Drift is closed structurally.** ADR-007 prevented component drift but left CSS and the palette as open vectors; this removes them. With no custom CSS and a grep-gated boundary, visual divergence is impossible, not merely discouraged.
- **Maintenance shed entirely.** No palette, no fonts, no motion, no scoped CSS to maintain or keep coherent — the solo-maintainer cost ADR-007 targeted, driven to zero.
- **The brand cost is accepted.** Vata looks like stock Radix (indigo, system fonts, no motion). For a local-first tool built by one maintainer, a maintenance-free, drift-proof UI is judged more valuable than a bespoke visual identity at this stage.

## Alternatives Considered

- **Keep brand via built-in named scales** (`accentColor="brown"`, `grayColor="sand"` — token-level, no custom CSS, as ADR-007 intended): rejected in favor of pure defaults, to keep the rule absolute and the theme configuration empty.
- **Keep Fraunces serif headings**: rejected — it requires an `@font-face` block, which is custom CSS.
- **Switch icons to `@radix-ui/react-icons`**: rejected — the Lucide registry gives better icon fidelity and is governance, not styling.

## Consequences

**Positive**: zero custom-CSS maintenance; visual drift structurally impossible; a single grep-gated rule (`no style=`, `no var(--`, `no .css` beyond the reduced `app.css`) gates every PR.

**Negative / Trade-offs**: the terracotta brand, Fraunces serif identity, and all micro-interactions are lost; some surfaces look generic; tabular date alignment and other flourishes disappear; a one-time cross-app rewrite touching ~30 files.

## References

- [ADR-007: Adopt Radix Themes](./0007-adopt-radix-themes.md) — superseded in part by this ADR (fonts, brand palette, and the scoped-CSS escape hatch it preserved are now removed)
