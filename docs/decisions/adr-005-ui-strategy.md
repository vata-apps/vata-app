# ADR-005: UI Strategy — HTML in MVP1–4, shadcn/ui in MVP5

**Status**: Accepted (revised 2026-04-04)
**Date**: 2025-02-22 (revised 2026-04-04)

## Context

The application needs a complete UI, but the early MVPs focus on infrastructure and data. Building with a component library before the data model is stable risks rework. The original plan used Mantine v7 and required Figma designs before starting the UI phase.

**Revised decision (2026-04-04)**: Switch from Mantine to shadcn/ui, and remove the Figma dependency. Screens are designed iteratively with AI-assisted development and user feedback.

## Decision

- **MVP1–4**: Use plain HTML with minimal CSS. No component library. Focus on infrastructure, data model, and functionality.
- **MVP5**: Introduce **shadcn/ui** (Radix UI primitives + Tailwind CSS), **Lucide React** icons, a complete design system (theme via CSS variables, colors, typography), and **react-i18next** for internationalization.
- **Screen design**: Screens are designed iteratively during implementation. No Figma dependency.

## Why shadcn/ui over Mantine

- **Ownership**: Components are copied into the project (`src/components/ui/`), not imported from a package. Full control over styling and behavior.
- **Tailwind CSS**: Utility-first approach composes well with Radix primitives and avoids CSS-in-JS overhead.
- **Radix UI**: Accessible, unstyled primitives provide solid foundations without opinionated styling.
- **Smaller footprint**: Only install components you actually use. No monolithic dependency.
- **Community momentum**: Widely adopted in the React/Next.js ecosystem with extensive component variants.

## Alternatives Considered

- **Mantine v7 (original choice)**: Complete out-of-the-box solution but heavier, less customizable, and requires Figma designs upfront.
- **Use shadcn/ui from MVP1**: Would create a polished UI early, but distracts from data model and infrastructure work.
- **Headless UI only (Radix without shadcn)**: Maximum flexibility but requires building all styling from scratch.

## Consequences

**Positive**:

- Early MVPs ship faster — no design debates or component styling
- Functionality is validated before investing in UI polish
- shadcn/ui adoption gives full ownership of component code
- No external design dependency (Figma) blocking progress
- i18n infrastructure added at the right time (when UI is being built)

**Negative / Trade-offs**:

- MVP1–4 have a basic, unattractive UI
- Migration from HTML to shadcn/ui components in MVP5 requires touching every UI file
- Tailwind CSS adds a build dependency and utility-class learning curve

## References

- [Tech Stack — shadcn/ui](../architecture/tech-stack.md#shadcnui)
- [Tech Stack — Internationalization](../architecture/tech-stack.md#internationalization-i18n)
- [Design System](../ui/design-system.md)
