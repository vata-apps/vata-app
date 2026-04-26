# Vata shadcn Review Checklist

Apply to changed files under `src/components/**`, `src/pages/**`, `src/routes/**`, `src/index.css`, `components.json`.

## Color tokens

- [ ] No literal hex (`#abc`, `#aabbcc`), `rgb(...)`, `hsl(...)`, or `oklch(...)` outside `src/index.css` and `src/components/ui/**`.
- [ ] All colors use semantic Tailwind utilities (`bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `text-destructive`, etc.).

## Inline styles

- [ ] No `style={{}}` prop for static styling. Allowed only for runtime values that cannot be expressed as a class.
- [ ] No color value (any format) inside any `style` prop.

## Primitives

- [ ] No hand-rolled modal, dropdown, popover, tabs, or button. Use `src/components/ui/` primitives.
- [ ] No use of `home/Modal.tsx` (being deprecated — issue #56).
- [ ] No reintroduction of `.btn`, `.btn-primary`, `.btn-ghost`, `.btn-danger`, `.modal-backdrop`, `.modal-shell`, `.modal-head`.

## i18n

- [ ] No user-facing string hardcoded in components. `useTranslation()` with the correct namespace.
- [ ] New keys added in both `src/i18n/locales/en/<ns>.json` and `src/i18n/locales/fr/<ns>.json`.

## English-only artifacts

- [ ] Identifiers, comments, JSDoc are in English.
- [ ] Commit messages, branch names, PR title/body in English.

## Imports

- [ ] shadcn primitives imported via `$components/ui/...` alias (no relative imports).

## Toaster

- [ ] No additional `<Toaster />` mount; only the one at app root.
- [ ] `toast` imported from `"sonner"`, not from a wrapper.

## Modal accessibility (if Dialog is bypassed)

- [ ] `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and ESC handler all present.
