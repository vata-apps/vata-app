# Design System Review Checklist

Walk this checklist for every UI element identified in a mockup, page, or audit pass.

## Per-component classification

- [ ] Listed every distinct UI element in the input (button, input, icon, avatar, card, list row, …)
- [ ] For each element, identified the matching wrapper in `src/components/ui/` (or "none")
- [ ] When a wrapper matches, named the exact `variant` and `size` that fit
- [ ] When close-but-not-exact, decided whether a new `tv()` variant or prop covers it (extend) vs a new wrapper (create)
- [ ] When proposing a new wrapper, justified in one sentence why no existing wrapper or extension fits
- [ ] Flagged any "compose-only" cases where a layout reuses existing atoms — no new file

## Token usage

- [ ] Every visible value (color, radius, font) maps to a `@theme` token from `src/styles/app.css`
- [ ] No raw `oklch()`, hex, `rgb()`, or `rgba()` outside `src/styles/`
- [ ] No `dark:` overrides — semantic tokens swap automatically
- [ ] No raw palette utilities for status (`text-red-500`, `bg-green-100`, …) — use semantic tokens

## Variant hygiene

- [ ] No two proposed components differ only by color/size/state (consolidate into a variant)
- [ ] Existing wrapper variants reused before adding new ones
- [ ] If extending an existing wrapper, the new variant has a clear semantic name (intent-based, not hex-based)

## Audit-mode checks (when invoked for DS health)

- [ ] Each wrapper in `src/components/ui/` has at least one import in `src/` (excluding its story / test files)
- [ ] No `tv()` base array repeated across files
- [ ] No Radix primitive composition repeated in 3+ places without a wrapper
- [ ] No token drift in `src/components/**`, `src/pages/**`, `src/routes/**` (no raw `oklch`, hex, rgb outside `src/styles/`)
- [ ] Storybook story exists and is current for every wrapper

## Report quality

- [ ] Every claim cites a file path; usage counts come from real `rg`/`grep` output
- [ ] Variants and sizes named are quoted from the actual `tv()` recipe, not guessed
- [ ] When proposing a new wrapper, named the underlying Radix primitive
- [ ] When the answer is "custom from scratch", provided an explicit one-sentence reason
- [ ] Open questions section lists everything the agent could not decide alone
