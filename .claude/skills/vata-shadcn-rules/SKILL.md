---
name: vata-shadcn-rules
description: Vata-specific UI rules layered on top of the official `shadcn` skill. Use when writing or reviewing files under `src/components/**`, `src/pages/**`, `src/routes/**`, `src/index.css`, or `components.json`. Complements (does not duplicate) the official skill which already covers theming, CLI, composition, forms, icons, and styling.
---

# Vata UI Rules

This skill adds Vata-specific constraints on top of the official `shadcn` skill (auto-activated when `components.json` is present). **Read the official skill first** for the generic shadcn rules (semantic tokens, `cn()`, composition, forms pattern, etc.). Only the project-specific rules below are repeated here.

## Where to find current setup

- `components.json` — shadcn config (style `new-york`, base color `neutral`, Tailwind v4, alias `$components/ui`)
- `src/components/ui/` — installed shadcn components
- `src/index.css` — semantic token definitions for `:root` and `.dark`
- `src/lib/utils.ts` — `cn()` helper
- Official skill at `.claude/skills/shadcn/SKILL.md` for everything else

## 1. No raw color values outside the design layer

Hex (`#abc`, `#aabbcc`), `rgb(...)`, `hsl(...)`, and `oklch(...)` literals are **forbidden** anywhere except:

- `src/index.css` (where the tokens are defined)
- `src/components/ui/**` (the shadcn components themselves)

Everywhere else (`src/components/**`, `src/pages/**`, `src/routes/**`), use semantic Tailwind utilities only: `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-destructive`, `bg-accent`, etc.

The hook `.claude/hooks/shadcn-guard.sh` blocks edits that violate this.

## 2. No `style={{}}` for static styling

`style` props are **only** allowed for runtime values that cannot be expressed as a class:

```tsx
// ✅ OK — runtime value
<div style={{ width: `${pct}%` }} />

// ❌ Not OK — use Tailwind classes
<div style={{ color: '#666', padding: 16 }} />
```

For colors specifically, see rule §1 — hex/rgb/hsl/oklch in any `style` prop is blocked by the hook regardless of whether the value is static or dynamic.

## 3. Never reimplement primitives

Before writing any interactive component (modal, dropdown, popover, button, dialog, tooltip, tabs…), check `src/components/ui/`. If it's missing, add it via the **shadcn MCP tools** (preferred) or `pnpm dlx shadcn@latest add <name>`.

Do **not** hand-roll a primitive. Past example to avoid: `src/components/home/Modal.tsx` reimplemented `Dialog` from scratch — see GitHub issue #56 for its migration.

## 4. Don't reintroduce `vata-ds.css` legacy classes

These class names are deprecated and being removed (see issue #56):

- `.btn`, `.btn-primary`, `.btn-ghost`, `.btn-danger` → use `<Button variant="...">`
- `.modal-backdrop`, `.modal-shell`, `.modal-head` → use `<Dialog>` from shadcn

Layout-only utilities (`.home-seg`, `.home-grid`, `.tcard`) in `src/styles/vata-ds.css` are still allowed.

## 5. i18n is mandatory for user-facing strings

No hardcoded user-visible text in any UI component. Always:

```tsx
import { useTranslation } from 'react-i18next';

const { t } = useTranslation('individuals'); // pick the right namespace
return <Button>{t('create')}</Button>;
```

Translations live in `src/i18n/locales/{en,fr}/<namespace>.json`. Add a key in **both** `en` and `fr` files when introducing new strings.

## 6. English only in code and artifacts

All identifiers, comments, file names, commit messages, branch names, GitHub issues, and PR titles/bodies are in **English**. French belongs only inside `src/i18n/locales/fr/*.json` (user-facing translations) and in chat with Steve.

## 7. Path aliases for shadcn imports

Always import shadcn primitives via the alias, never relative:

```tsx
// ✅
import { Button } from '$components/ui/button';

// ❌
import { Button } from '../../components/ui/button';
```

## 8. Toaster is mounted once at the app root

`<Toaster />` (from `$components/ui/sonner`) is mounted in the root entry. Do not mount additional `<Toaster />` instances. Trigger toasts with `import { toast } from "sonner"`; do not wrap.

## 9. Modal accessibility (when bypassing `Dialog`)

If a use case forces a custom modal (very rare — prefer shadcn `Dialog`), it must have `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and an Escape handler. Existing rule from CLAUDE.md, repeated here as the most common gap.

## See also

- Official `shadcn` skill — generic shadcn rules (always check first)
- `.claude/skills/typescript-standards/SKILL.md` — TS/React conventions
- `.claude/skills/testing-standards/SKILL.md` — testing conventions
- https://ui.shadcn.com/llms.txt — full shadcn documentation index
- For a concise reviewer's checklist, see [checklist.md](checklist.md)
