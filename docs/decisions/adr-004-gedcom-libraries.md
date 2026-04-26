# ADR-004: GEDCOM Libraries — gedcom-parser and gedcom-date (in-app)

**Status**: Accepted  
**Date**: 2025-02-22  
**Updated**: 2025-02-23

## Context

Vata needs to parse, validate, and serialize GEDCOM 5.5.1 files and handle genealogical dates (partial dates, approximate dates, ranges, multiple calendar systems). Implementing these from scratch would be a significant effort and error-prone.

## Decision

**Do not use separate npm packages for now.** Implement the logic for **gedcom-parser** and **gedcom-date** directly inside the Vata-App codebase, as two **in-app modules** with a clear public API and zero dependency on the rest of the app. Structure the code so that it can be **extracted into separate publishable packages later** if desired.

- **gedcom-parser**: Parses GEDCOM 5.5.1 text into typed structures and serializes back to GEDCOM format. Handles hierarchical structures, cross-references, continuation lines, and encoding.
- **gedcom-date**: Parses, formats, validates, and compares genealogical dates. Supports GEDCOM date syntax (ABT, BEF, AFT, BET...AND, calendar prefixes).

Both modules are zero-dependency, tree-shakeable, and TypeScript-first. When extracted, they will be published under the **`@vata-apps/`** scope (e.g. `@vata-apps/gedcom-date`, `@vata-apps/gedcom-parser`).

## In-app structure (extraction-ready)

- **Location**: `src/gedcom-date/` and `src/gedcom-parser/` in the frontend (React/Vite) source tree.
- **Public API**: Each module exposes only its `index.ts`; the app and gedcom-parser (for dates) import via path aliases.
- **Path aliases** (in `tsconfig.json`): `@vata-apps/gedcom-date` → `./src/gedcom-date`, `@vata-apps/gedcom-parser` → `./src/gedcom-parser`.
- **Dependency rule**: Nothing outside these folders may be imported from inside them. Only: **app → gedcom-parser**, **app → gedcom-date**, and optionally **gedcom-parser → gedcom-date**.
- **No npm dependencies** inside the gedcom-* folders.

Example usage in the app:

```ts
import { parseDate, formatDate, type GedcomDate } from "@vata-apps/gedcom-date";
import { parseDocument, serialize, type GedcomDocument } from "@vata-apps/gedcom-parser";
```

## Future extraction

If these modules are later published as separate packages:

1. Copy the module folder (e.g. `gedcom-date/`) into a new repo.
2. Add `package.json` with `name: "@vata-apps/gedcom-date"` (or `gedcom-parser`), `tsconfig.json`, and a build (tsup, unbuild, or tsc).
3. In the gedcom-parser repo, replace the local import of gedcom-date with the npm dependency `@vata-apps/gedcom-date`.
4. In Vata-App: remove the local folders and add the dependency (e.g. `pnpm add @vata-apps/gedcom-date @vata-apps/gedcom-parser`).

## Alternatives considered

- **Separate packages from day one**: Rejected for now to simplify the project; the in-app structure allows extraction later without rewriting.
- **Build from scratch in the app without structure**: Would make future extraction difficult; the current decision keeps a clear boundary.
- **Existing npm packages**: No existing package provides complete, typed, zero-dependency GEDCOM 5.5.1 support with serialization.

## Consequences

**Positive**:

- No external dependency to manage for GEDCOM logic in the short term.
- Full control over API and implementation inside the repo.
- Same benefits when extracted: zero dependencies, small bundle, type-safe API.
- Clear module boundaries and path aliases make extraction a mechanical copy + publish step.

**Negative / trade-offs**:

- Logic lives in the app repo until extraction; any fix is in-app first.
- Documentation for the "library" API lives in the app docs (e.g. this ADR) until packages exist.

## References

- [GEDCOM 5.5.1 Mapping](../references/gedcom-551-mapping.md)
- [Date Formats](../references/date-formats.md)
