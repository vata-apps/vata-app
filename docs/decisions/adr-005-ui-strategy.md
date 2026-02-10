# ADR-005: UI Strategy — HTML in MVP1–3, Mantine in MVP4

**Status**: Accepted  
**Date**: 2025-02-22

## Context

The application needs a complete UI, but design work (Figma) is not ready for the early MVPs. Waiting for designs before starting development would delay the entire project. At the same time, building with a component library before the design system is finalized risks rework.

## Decision

- **MVP1–3**: Use plain HTML with minimal CSS. No component library. Focus on infrastructure, data model, and functionality.
- **MVP4**: Introduce **Mantine v7** as the component library, along with Tabler Icons, a complete design system (theme, colors, typography), and **react-i18next** for internationalization.

## Alternatives Considered

- **Use Mantine from MVP1**: Would create a polished UI early, but risks significant rework when the actual Figma designs arrive. Delays MVP1 with UI decisions that aren't the priority.
- **Use a lighter library (e.g., Radix, Headless UI)**: Less opinionated but requires more custom styling work. Mantine provides a more complete out-of-the-box solution.
- **Build custom components**: Maximum flexibility but very high effort for a solo developer.

## Consequences

**Positive**:
- Early MVPs ship faster — no design debates or component styling
- Functionality is validated before investing in UI polish
- Mantine adoption happens once, aligned with finalized designs
- i18n infrastructure added at the right time (when UI is being built)

**Negative / Trade-offs**:
- MVP1–3 have a basic, unattractive UI
- HTML-only prototypes may not fully validate UX assumptions
- Migration from HTML to Mantine components requires touching every UI file

## References

- [Tech Stack — Mantine 7](../architecture/tech-stack.md#mantine-7)
- [Tech Stack — Internationalization](../architecture/tech-stack.md#internationalization-i18n)
