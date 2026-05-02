# Design System Review Checklist

Walk this checklist for every UI element identified in a mockup, page, or audit pass.

## Per-component classification

- [ ] Listed every distinct UI element in the input (button, input, icon, avatar, card, list row, …)
- [ ] For each element, identified the matching wrapper in `src/components/ui/` (or "none")
- [ ] When a wrapper matches, named the exact `variant` and `size` that fit
- [ ] When close-but-not-exact, decided whether a new `tv()` variant or prop covers it (extend) vs a new wrapper (create)
- [ ] When proposing a new wrapper, checked the shadcn registry first (`npx shadcn@latest search <keyword>`)
- [ ] When proposing a new wrapper, justified in one sentence why no existing wrapper or extension fits
- [ ] Flagged any "compose-only" cases where a layout reuses existing atoms — no new file

## Token usage

- [ ] Every visible color in the input maps to a semantic token (`bg-primary`, `text-muted-foreground`, …)
- [ ] No hardcoded `oklch(...)`, `#hex`, `rgb(...)` proposed in JSX
- [ ] Every radius maps to `rounded-{sm,md,lg,xl}` / `--radius*`
- [ ] No `dark:` overrides proposed — semantic tokens swap automatically
- [ ] Status colors use `Badge`/`Alert`/destructive variants, not raw palette utilities

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

- [ ] Every claim cites a file path; usage counts come from real `grep` output
- [ ] Variants and sizes named are quoted from the actual `tv()` recipe, not guessed
- [ ] No new component proposed without naming the underlying Radix primitive or shadcn registry item (or explicit "custom from scratch + reason")
- [ ] Open questions section lists everything the agent could not decide alone
