# Design System Review Checklist

Walk this checklist for every UI element identified in a mockup, page, or audit pass.

## Per-component classification

- [ ] Listed every distinct UI element in the input (button, input, icon, avatar, card, list row, …)
- [ ] For each element, named the matching Radix Themes component (or "compose" / "organism")
- [ ] When a Radix Themes component matches, named the exact `variant` / `size` / `color` props that fit
- [ ] Flagged any "compose-only" cases where a layout reuses known components — no new file
- [ ] When proposing an internal component, justified in one sentence why it is a genuine application organism (not a restyled atom/molecule)

## Brand tokens

- [ ] No hardcoded color literals (`oklch()`, hex, `rgb()`, `rgba()`) in components or pages — color comes from Radix accent/gray scales and the `color` prop
- [ ] No per-component theme override — appearance is bound at the `<Theme>` provider
- [ ] No CSS framework utilities (`tailwind`, `tv()`, stray `className`) — layout uses Radix Themes primitives

## Duplication hygiene

- [ ] No Radix Themes composition repeated in 3+ pages without an organism
- [ ] No same JSX shape inlined in 3+ places without a composition helper
- [ ] A new internal component is reserved for a real application organism, not a styled primitive

## Audit-mode checks (when invoked for DS health)

- [ ] Each internal component in `src/components/` has at least one import in `src/` (excluding its own test file)
- [ ] No Radix Themes composition repeated in 3+ places without an organism
- [ ] No styling drift in `src/components/**`, `src/pages/**`, `src/routes/**` (no raw color literals, no `tailwind`/`tv(`/stray `className`)

## Report quality

- [ ] Every claim cites a file path; usage counts come from real `rg`/`grep` output
- [ ] Component and prop names are quoted from the Radix Themes docs, not guessed
- [ ] When proposing an internal component, named the underlying Radix Themes pieces it composes
- [ ] When the answer is "bespoke with scoped CSS", provided an explicit one-sentence reason
- [ ] Open questions section lists everything the agent could not decide alone
