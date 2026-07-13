# ADR-0014: Headless UI Foundation — Base UI + Vanilla Extract, Restoring the Warm-Earth Brand

**Status**: Accepted
**Date**: 2026-07-11

## Context

The UI foundation has swung between two extremes:

- [ADR-007](./0007-adopt-radix-themes.md) adopted **Radix Themes** (a styled, opinionated component library) but deliberately kept a brand layer: self-hosted **Geist / Fraunces / Geist Mono** fonts, a **terracotta accent + warm sand** oklch palette, and **scoped local CSS as an escape hatch** for bespoke surfaces.
- [ADR-010](./0010-pure-radix-themes.md) found that escape hatch had drifted — `app.css` grew back to 431 lines of custom palette, `@font-face`, and per-component decoration — and went the other way: **pure Radix Themes**, dropping the fonts, the terracotta palette, motion, and all custom CSS. It explicitly accepted the cost: "the terracotta brand, Fraunces serif identity, and all micro-interactions are lost; some surfaces look generic," judging a drift-proof, maintenance-free UI "more valuable than a bespoke visual identity at this stage."

Building real screens against that decision reversed the bet. As soon as a screen needs anything past a stock pattern — the Person editor, the relations organism, the pedigree chart — you either fight Radix Themes or drop to a custom organism that sits visibly beside stock components. That visible boundary (a "seam") is structural to a styled library, and it is worst for Vata specifically: our bespoke surface (pedigree, timelines, relation editors, family sheets) is large, which is exactly where a styled library's value is smallest and its seams most frequent. Meanwhile the generic indigo/system-font look ADR-010 accepted became a real product drag — the app lacks personality.

The precise lesson from ADR-010 is that **the brand was never the problem; the escape hatch was.** A 431-line hand-authored `app.css` is a drift vector. A **typed, zero-runtime token contract is not an escape hatch — it is a structured foundation.** That distinction is what makes restoring the brand safe this time.

## Decision

Move off Radix Themes to a **headless** foundation and re-author the visual layer over a typed token contract.

- **Behavior layer: Base UI** (`@base-ui/react`). Dialog, Select, Switch, Popover, etc. supply accessibility, focus management, and keyboard behavior — the expensive, generic parts — with no imposed styling.
- **Styling / token layer: Vanilla Extract** (`@vanilla-extract/css`). A typed, zero-runtime token contract (`src/design/theme.css.ts`, light + dark) is the single source of visual truth. Every component styles itself from `vars.*`. No hand-authored global CSS palette, no `app.css` escape hatch.
- **Brand restored.** The warm-earth identity ADR-010 removed comes back, as tokens: **terracotta (clay) accent, warm sand neutrals, moss / ink secondaries**, all in `oklch`. **Geist Sans** for UI and body, **Geist Mono** for data (dates, IDs). **Fraunces (italic)** is the signature, spent with restraint on lineage moments only — a person's name, the home hero, empty states, display-scale section titles — never on dense UI chrome. Fonts are self-hosted via `@fontsource/*`.
- **No inherited token architecture.** We do **not** carry over shadcn's or Radix's semantic token sprawl. The contract holds only what the product uses now and grows as screens demand it — MVP, adjusted in flight.
- **Coexistence, then migration.** Radix Themes and Base UI coexist during the transition; screens migrate one at a time, the real wired `PersonEditorDialog` first. No big-bang rewrite.

## Why

- **It answers ADR-010's actual concern without paying its cost.** ADR-010 closed drift by forbidding brand. Vanilla Extract closes drift by making the brand a typed contract with zero runtime — a structured foundation, not the scoped-CSS escape hatch that drifted. Personality and drift-resistance stop being a trade-off.
- **It removes the seam entirely.** With everything authored over one token contract, there is no "stock" layer left for a custom organism to clash with. The seam class of problem — the thing that made the current relations UI look bolted-on — disappears.
- **It fits Vata's shape.** A large bespoke surface is precisely where headless wins: you own every organism anyway, so inheriting a styled library only imposes a look you must then fight.
- **It fits the maintainer.** Authoring the visual layer is a capability here, not a cost — and the warm-earth system already existed and was well-liked before ADR-010 removed it.
- **Validated by a spike (2026-07-11).** The Person editor modal was rebuilt on Base UI + Vanilla Extract at the DEV route `/ds-spike`, reproducing the recovered prototype in light and dark with the Relations organism fully integrated and no seam.

## Alternatives Considered

- **Stay pure Radix Themes (ADR-010).** Rejected — the genericness is now a concrete product problem, and the seam surfaces wherever bespoke meets stock, which for Vata is nearly everywhere.
- **Radix Themes + custom organisms on Radix Primitives.** Rejected — this _is_ the seam (your organism's visual DNA against Radix's defaults); the spike showed the goal must be to eliminate it, not manage it.
- **shadcn/ui.** Rejected — its Tailwind + copy-paste-components paradigm is one the maintainer explicitly does not want.
- **Restore brand via Radix named scales** (`accentColor="brown"`, a self-hosted-font carve-out). Rejected — token-level theming can neither remove the seam nor give full control of bespoke organisms; it is still a styled library underneath.

## Consequences

**Positive**: a distinctive, owned visual identity is restored; drift is closed by a typed contract rather than by banning brand; bespoke organisms are fully controllable with no seams; zero-runtime CSS suits the Tauri webview (no FOUC).

**Negative / Trade-offs**: a cross-app migration off Radix Themes, screen by screen; two UI systems coexist during the transition; the team owns a styling layer it previously outsourced (the deliberate point); Base UI is younger and less battle-tested than Radix Themes.

**Supersedes** [ADR-007](./0007-adopt-radix-themes.md) (Radix Themes adoption) and [ADR-010](./0010-pure-radix-themes.md) (pure Radix Themes / no brand). ADR-0011's full-width shell and the Lucide icon registry are unaffected.

## References

- [ADR-007: Adopt Radix Themes](./0007-adopt-radix-themes.md) — superseded
- [ADR-010: Pure Radix Themes](./0010-pure-radix-themes.md) — superseded
- Spike: DEV route `/ds-spike`, `src/design/theme.css.ts`, `src/design/person-modal-spike.css.ts`
- Recovered design prototypes: `docs/design/prototypes/person-modal-layout-b.html`
- Source design system: the maintainer's `claude.ai/design` project (warm-earth oklch tokens, Fraunces + Geist)
