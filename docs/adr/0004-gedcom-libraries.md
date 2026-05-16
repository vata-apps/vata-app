# ADR-004: GEDCOM Libraries — gedcom-parser and gedcom-date (in-app)

**Status**: Accepted  
**Date**: 2025-02-22  
**Updated**: 2025-02-23

## Context

Vata needs to parse, validate, and serialize GEDCOM 5.5.1 files and handle genealogical dates (partial dates, approximate dates, ranges, multiple calendar systems). Implementing these from scratch is significant effort, but no existing npm package provides complete, typed, zero-dependency GEDCOM 5.5.1 support with serialization.

## Decision

**Do not use separate npm packages for now.** Implement **gedcom-parser** and **gedcom-date** directly inside the Vata-App codebase as two in-app modules with a clear public API and zero dependency on the rest of the app, structured for later mechanical extraction into `@vata-apps/` packages.

- **gedcom-parser**: Parses GEDCOM 5.5.1 text into typed structures and serializes back. Handles hierarchical structures, cross-references, continuation lines, and encoding.
- **gedcom-date**: Parses, formats, validates, and compares genealogical dates. Supports GEDCOM date syntax (ABT, BEF, AFT, BET...AND, calendar prefixes).

Both modules are zero-dependency, tree-shakeable, and TypeScript-first.

## In-app structure (extraction-ready)

- **Location**: `src/gedcom-date/` and `src/gedcom-parser/` in the frontend source tree.
- **Public API**: Each module exposes only its `index.ts`.
- **Path aliases**: `@vata-apps/gedcom-date` → `./src/gedcom-date`, `@vata-apps/gedcom-parser` → `./src/gedcom-parser` (in `tsconfig.json` and `vite.config.ts`).
- **Dependency rule**: Nothing outside these folders may be imported from inside them. Allowed directions only: **app → gedcom-parser**, **app → gedcom-date**, and optionally **gedcom-parser → gedcom-date**. No npm dependencies inside the `gedcom-*` folders.

Because the modules are self-contained with stable aliases, extraction is a mechanical copy-out into a new repo plus a `package.json` and build — no rewrite of the app or the modules.

## Alternatives considered

- **Separate packages from day one**: Rejected for now to simplify the project; the in-app structure allows extraction later without rewriting.
- **Build from scratch in the app without structure**: Would make future extraction difficult; the current decision keeps a clear boundary.
- **Existing npm packages**: None provide complete, typed, zero-dependency GEDCOM 5.5.1 support with serialization.

## Consequences

**Positive**:

- No external dependency to manage for GEDCOM logic in the short term.
- Full control over API and implementation inside the repo.
- Clear module boundaries and path aliases make extraction a mechanical copy + publish step.

**Negative / trade-offs**:

- Logic lives in the app repo until extraction; any fix is in-app first.
- Documentation for the "library" API lives in the app docs until packages exist.

## References

- [GEDCOM 5.5.1 Mapping](../references/gedcom-551-mapping.md)
- [Date Formats](../references/date-formats.md)
