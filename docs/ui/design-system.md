# Design System

> **MVP6**: The full design system (shadcn/ui + Tailwind CSS, colors, typography, components) is applied from MVP6. MVP1–5 use a minimal HTML UI without a component library.

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

```
Brand (Primary Blue)
├── 50   #f0f4ff  (very light backgrounds)
├── 100  #dce4f5  (light backgrounds)
├── 200  #b4c6e7  (borders)
├── 300  #8aa5da  (inactive icons)
├── 400  #6889cf  (hover states)
├── 500  #5278c8  (links)
├── 600  #466fc6  (primary buttons)
├── 700  #375eaf  (button hover)
├── 800  #2d539e  (accents)
└── 900  #1e478d  (strong text)
```

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

**Inter** - Modern sans-serif, excellent readability

```css
font-family:
  "Inter",
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

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

### Tailwind CSS Configuration

```css
/* src/index.css — CSS variables for theming */
@layer base {
  :root {
    --font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
}
```

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
      fontSize: {
        xs: ["11px", { lineHeight: "1.4" }],
        sm: ["12px", { lineHeight: "1.5" }],
        base: ["14px", { lineHeight: "1.5" }],
        lg: ["16px", { lineHeight: "1.4" }],
        xl: ["20px", { lineHeight: "1.4" }],
        "2xl": ["24px", { lineHeight: "1.3" }],
        "3xl": ["32px", { lineHeight: "1.2" }],
      },
    },
  },
};
```

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

### Library: Lucide React

Stroke-style icons, consistent, 24x24 by default. Import from `lucide-react`.

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
