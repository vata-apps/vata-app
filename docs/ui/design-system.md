# Design System

> The design system is built on Tailwind v4 (CSS-first via `@theme`) with Radix primitives and `tailwind-variants`. The canonical token source is [`src/styles/app.css`](../../src/styles/app.css); UI wrappers live under [`src/components/ui/`](../../src/components/ui/). When this document and the source disagree, **the source wins** — open a PR against this file to bring it back in sync.

## Design Principles

### 1. Clarity

- Clearly hierarchized information
- Readable typography
- Generous spacing

### 2. Efficiency

- Main actions easily accessible
- Keyboard shortcuts
- Ubiquitous search

### 3. Familiarity

- Standard UX patterns
- Predictable behaviors
- Desktop conventions respected

### 4. Flexibility

- Adaptable interface
- Resizable panels
- Light/dark theme

---

## Color Palette

### Primary Colors

The primary palette and every surface/state token live in [`src/styles/app.css`](../../src/styles/app.css) as `@theme` CSS variables in `oklch()` (current primary: terracotta `--color-primary`). Consume them via Tailwind utilities (`bg-primary`, `text-primary-foreground`, `border-border`, `ring-ring`, …) — never reference hex values in components. The full list of tokens is reproduced below in the [Tailwind v4 — CSS-first configuration](#tailwind-v4--css-first-configuration) section.

### Semantic Colors

```
Success (Green)
├── Light  #d3f9d8
├── Main   #40c057
└── Dark   #2f9e44

Warning (Orange)
├── Light  #fff3bf
├── Main   #fab005
└── Dark   #f59f00

Error (Red)
├── Light  #ffe3e3
├── Main   #fa5252
└── Dark   #e03131

Info (Light Blue)
├── Light  #d0ebff
├── Main   #339af0
└── Dark   #1c7ed6
```

### Gender Colors (genealogical convention)

```
Male       #74c0fc (light blue)
Female     #fcc2d7 (light pink)
Unknown    #dee2e6 (gray)
```

### Dark Theme

```
Background
├── Primary    #1a1b1e
├── Secondary  #25262b
└── Tertiary   #2c2e33

Text
├── Primary    #c1c2c5
├── Secondary  #909296
└── Muted      #5c5f66

Border         #373a40
```

---

## Typography

### Primary Font

The font stack lives in [`src/styles/app.css`](../../src/styles/app.css) under `--font-sans` — currently **Geist** (self-hosted in `src/styles/fonts/`). Consume it via the Tailwind `font-sans` utility rather than redeclaring `font-family` in component CSS. Override the token in `@theme` if the project needs a different face later; do not hardcode font names in components.

### Type Scale

| Level | Size | Line Height | Weight | Usage            |
| ----- | ---- | ----------- | ------ | ---------------- |
| h1    | 32px | 1.2         | 700    | Page titles      |
| h2    | 24px | 1.3         | 600    | Section titles   |
| h3    | 20px | 1.4         | 600    | Subsections      |
| h4    | 16px | 1.4         | 600    | Card titles      |
| body  | 14px | 1.5         | 400    | Body text        |
| small | 12px | 1.5         | 400    | Labels, metadata |
| xs    | 11px | 1.4         | 400    | Tags, badges     |

### Tailwind v4 — CSS-first configuration

There is **no `tailwind.config.ts`**. Theme tokens live in `@theme { ... }` inside [`src/styles/app.css`](../../src/styles/app.css), expressed in `oklch()`. Light/dark/system theming is handled in the same file.

```css
/* src/styles/app.css (excerpt) */
@import 'tailwindcss';

@theme {
  --font-sans: 'Geist', ui-sans-serif, system-ui, sans-serif;
  --color-background: oklch(0.985 0.012 85);
  --color-foreground: oklch(0.22 0.028 45);
  --color-primary: oklch(0.54 0.13 32); /* terracotta */
  --color-destructive: oklch(0.555 0.195 27);
  --radius: 0.5rem;
}
```

The type-scale values listed above (h1 32px / body 14px / xs 11px / …) are applied via Tailwind utility classes (`text-3xl`, `text-sm`, `text-xs`, …) on heading and body elements; they map to Tailwind v4's default font-size scale unless overridden in `@theme`.

---

## Spacing

### Scale

```
xs   4px   (minimal spacing)
sm   8px   (tight spacing)
md   16px  (standard spacing)
lg   24px  (large spacing)
xl   32px  (section spacing)
xxl  48px  (page spacing)
```

### Usage

```
Card padding:      md (16px)
Gap between cards: md (16px)
Section margin:    xl (32px)
Page padding:      lg-xl (24-32px)
Form gap:          sm-md (8-16px)
```

---

## Borders and Shadows

### Border Radii

```
xs   2px   (badges, tags)
sm   4px   (inputs, buttons)
md   8px   (cards, form windows, in-window dialogs)
lg   12px  (panels)
xl   16px  (large cards)
```

### Shadows

```css
/* Subtle - for light elevation */
box-shadow:
  0 1px 3px rgba(0, 0, 0, 0.05),
  0 1px 2px rgba(0, 0, 0, 0.1);

/* Small - cards at rest */
box-shadow:
  0 1px 3px rgba(0, 0, 0, 0.1),
  0 1px 2px rgba(0, 0, 0, 0.06);

/* Medium - cards on hover, dropdowns */
box-shadow:
  0 4px 6px rgba(0, 0, 0, 0.1),
  0 2px 4px rgba(0, 0, 0, 0.06);

/* Large - form windows, popovers, in-window dialogs */
box-shadow:
  0 10px 15px rgba(0, 0, 0, 0.1),
  0 4px 6px rgba(0, 0, 0, 0.05);
```

---

## Base Components

### Buttons

#### Primary (filled) — `[ Create a person ]`

- Background: `brand.600`
- Text: white
- Hover: `brand.700`

#### Secondary (outline) — `[ Cancel ]`

- Border: `gray.400`
- Text: `gray.700`
- Hover: `gray.50` background

#### Subtle (transparent) — `[ More options ]`

- Background: transparent
- Text: `gray.600`
- Hover: `gray.100` background

#### Danger (filled) — `[ Delete ]`

- Background: `red.600`
- Text: white

#### Sizes

| Name | Height |
| ---- | ------ |
| xs   | 24px   |
| sm   | 30px   |
| md   | 36px   |
| lg   | 42px   |

### Inputs

#### Text Input

- **Label:** First Name
- **Example value:** Jean-Pierre

#### Select

- **Label:** Gender
- **Example value:** Male (with dropdown indicator)

#### Date (free format)

- **Label:** Date of Birth
- **Example value:** ABT 1845
- **Helper:** "Formats: 1845, JAN 1845, 1 JAN 1845, ABT..."

#### Input States

| State    | Style                                  |
| -------- | -------------------------------------- |
| Default  | Border `gray.300`                      |
| Focus    | Border `brand.500`, ring `brand.100`   |
| Error    | Border `red.500`, helper text in red   |
| Disabled | Background `gray.100`, text `gray.500` |

### Cards

#### Person Card (compact)

- **Gender icon** + **Name:** Jean-Pierre DUPONT
- **Dates:** 1845 – 1920
- **Place:** Montreal, Quebec

#### Person Card (detailed)

- **Gender icon** (larger) + **Full name:** Jean-Pierre Marie DUPONT + **Actions menu** (⋮)
- **Birth:** 15 Jan 1845, Montreal
- **Death:** 3 Mar 1920, Quebec
- **Occupation:** Farmer
- **Parents:** Pierre Dupont, Marie Tremblay

#### Event Card

- **Event type:** ○ Birth — **Date:** 15 Jan 1845
- **Place:** Montreal, Quebec, Canada
- **Description:** (optional event description)

### Badges and Tags

#### Gender

`♂ Male` · `♀ Female` · `? Unknown`

#### Living Status

`● Living` · `○ Deceased`

#### Name Type

`Birth` · `Marriage` · `Alias`

#### Counters

Children (5) · Events (12)

---

## Iconography

### Library: Lucide React (via curated wrapper)

Icons are exposed through a curated registry in [`src/components/ui/icon.tsx`](../../src/components/ui/icon.tsx) — pages and components must consume them as `<Icon name="…" />` and **never import directly from `lucide-react`**. The wrapper constrains the available icons to the project's design intent, gives a single source of truth for sizing, and keeps unused glyphs out of the bundle. Add a new entry to `iconRegistry` when a screen genuinely needs a new glyph.

### Main Icons

```
Navigation
├── Home             Home
├── TreePine         Tree
├── Users            Individuals
├── UsersRound       Families
├── CalendarDays     Events
├── MapPin           Places
└── Settings         Settings

Actions
├── Plus             Add
├── Pencil           Edit
├── Trash2           Delete
├── Search           Search
├── Download         Export
├── Upload           Import
└── MoreVertical     Menu

Gender
├── Circle (blue)    Male
├── Circle (pink)    Female
└── Circle (gray)    Unknown

Events
├── Baby             Birth
├── Cross            Death
├── Heart            Marriage
├── HeartCrack       Divorce
├── Church           Christening
└── Briefcase        Occupation

Feedback
├── Check            Success
├── X                Error
├── AlertTriangle    Warning
└── Info             Info
```

---

## Animations and Transitions

### Durations

```
Instant    0ms    (focus rings)
Fast       100ms  (hover states)
Normal     200ms  (most transitions)
Slow       300ms  (in-window dialogs, panels)
```

### Easing Curves

```css
/* Standard - for most transitions */
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

/* Enter - elements appearing */
transition-timing-function: cubic-bezier(0, 0, 0.2, 1);

/* Exit - elements disappearing */
transition-timing-function: cubic-bezier(0.4, 0, 1, 1);
```

### Examples

```css
/* Button hover */
.button {
  transition: background-color 100ms ease;
}

/* In-window dialog opening */
.confirm-dialog {
  transition:
    opacity 200ms ease,
    transform 200ms ease;
}

/* Sidebar expansion */
.sidebar {
  transition: width 300ms ease;
}
```

---

## Responsive and Breakpoints

Although desktop-first, the interface must adapt to different window sizes:

```
Compact    < 1024px   Collapsed sidebar, simplified layout
Standard   1024-1440px Normal layout
Wide       > 1440px   Additional panels visible
```

### Adaptive Behaviors

#### Compact (< 1024px)

- Collapsed sidebar (icons only)
- Detail panel as overlay or standalone window
- Menus in dropdown instead of always visible

#### Standard (1024–1440px)

- Expanded sidebar
- Centered main content
- Optional detail panel

#### Wide (> 1440px)

- Expanded sidebar
- Wide main content
- Always visible detail panel

---

## Accessibility

### WCAG 2.1 AA Principles

1. **Contrast**: Minimum ratio 4.5:1 for text, 3:1 for UI elements
2. **Visible focus**: Visible focus ring on all interactive elements
3. **Keyboard**: Full keyboard navigation possible
4. **Labels**: All inputs have associated labels
5. **Errors**: Descriptive error messages associated with fields

### Focus States

```css
/* Visible focus for all interactive elements */
:focus-visible {
  outline: 2px solid var(--brand-500);
  outline-offset: 2px;
}

/* No outline on mouse click */
:focus:not(:focus-visible) {
  outline: none;
}
```

### Keyboard Shortcuts (planned)

```
Navigation
├── Ctrl+N       New person
├── Ctrl+S       Save
├── Esc          Close in-window dialog or panel

View
├── Ctrl+1       Tree view
├── Ctrl+2       Individual list view
├── Ctrl+3       Family view
```
