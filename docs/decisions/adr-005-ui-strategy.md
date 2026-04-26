# ADR-005: UI Strategy — shadcn/ui as the Foundation

**Status**: Accepted (revised 2026-04-04)
**Date**: 2025-02-22 (revised 2026-04-04)

## Context

The application needs a complete UI library that is accessible, customizable, and fits the local-first desktop context. The original plan used Mantine v7 and required Figma designs before starting UI work.

**Revised decision (2026-04-04)**: Adopt shadcn/ui and remove the Figma dependency. Screens are designed iteratively with AI-assisted development and user feedback.

## Decision

- **UI library**: **shadcn/ui** (Radix UI primitives + Tailwind CSS).
- **Icons**: **Lucide React**.
- **Design system**: Theme via CSS variables, colors, typography defined in `src/index.css` and `tailwind.config.ts`.
- **Internationalization**: **react-i18next** with namespace-based translation files.
- **Screen design**: Screens are designed iteratively during implementation. No Figma dependency.

## Why shadcn/ui over Mantine

- **Ownership**: Components are copied into the project (`src/components/ui/`), not imported from a package. Full control over styling and behavior.
- **Tailwind CSS**: Utility-first approach composes well with Radix primitives and avoids CSS-in-JS overhead.
- **Radix UI**: Accessible, unstyled primitives provide solid foundations without opinionated styling.
- **Smaller footprint**: Only install components you actually use. No monolithic dependency.
- **Community momentum**: Widely adopted in the React/Next.js ecosystem with extensive component variants.

## Alternatives Considered

- **Mantine v7 (original choice)**: Complete out-of-the-box solution but heavier, less customizable, and requires Figma designs upfront.
- **Headless UI only (Radix without shadcn)**: Maximum flexibility but requires building all styling from scratch.

## Consequences

**Positive**:

- Full ownership of component code — no surprise breaking changes from a package
- Tailwind CSS theming via CSS variables keeps light/dark mode straightforward
- No external design dependency (Figma) blocking progress
- i18n infrastructure built on the most widely supported React i18n stack

**Negative / Trade-offs**:

- Tailwind CSS adds a build dependency and utility-class learning curve
- Adding new shadcn components is a manual CLI step rather than a typed import

## References

- [Tech Stack — shadcn/ui](../architecture/tech-stack.md#shadcnui)
- [Tech Stack — Internationalization](../architecture/tech-stack.md#internationalization-i18n)
- [Design System](../ui/design-system.md)
