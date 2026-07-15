# Vata — Documentation

Desktop application for managing genealogical trees. Local-first, GEDCOM 5.5.1 compatible, built with Tauri + React + TypeScript.

---

## Product

- [PRD](./product/prd.md) — Vision, problem, principles, scope
- [Personas](./product/personas.md) — Target user profiles
- [Glossary](../CONTEXT.md) — Domain language: genealogical terms, relationships, flagged ambiguities

## Decisions (ADR)

- [ADR-001: Desktop Framework](./adr/0001-desktop-framework.md) — Tauri over Electron
- [ADR-002: Frontend Stack](./adr/0002-frontend-stack.md) — React, TypeScript, Vite, TanStack, Zustand
- [ADR-003: Database Architecture](./adr/0003-database-architecture.md) — Dual DB, string IDs, layer separation
- [ADR-004: GEDCOM Libraries (in-app)](./adr/0004-gedcom-libraries.md) — gedcom-parser and gedcom-date as in-app modules
- [ADR-005: UI Strategy](./adr/0005-ui-strategy.md) — Radix + Tailwind v4 + tailwind-variants (superseded by ADR-007)
- [ADR-006: Import/Export](./adr/0006-import-export.md) — Two-phase import, round-trip export
- [ADR-007: UI Foundation](./adr/0007-adopt-radix-themes.md) — Radix Themes, dropping Tailwind + the wrapper layer
- [ADR-008: Autonomous Agent Execution](./adr/0008-autonomous-agent-execution.md) — Sandcastle on GitHub Actions, label-triggered (provider superseded by ADR-015)
- [ADR-009: Agent Addresses PR Review Feedback](./adr/0009-agent-review-feedback.md) — review-triggered agent loop on agent PRs (superseded by ADR-016)
- [ADR-015: Migration to OpenCode Go](./adr/0015-migration-to-opencode-go.md) — replaces Anthropic API with OpenCode Go subscription (Kimi K2.7 Code default, Qwen3.7 Max escalation)
- [ADR-016: Autonomous PR Review Agent](./adr/0016-autonomous-pr-review.md) — automatic review of agent PRs by a second bot identity
- [ADR-010: Pure Radix Themes](./adr/0010-pure-radix-themes.md) — Drop brand palette, custom fonts, motion, and scoped CSS (supersedes parts of ADR-007)
- [ADR-011: Full-Width In-Tree Shell](./adr/0011-full-width-shell.md) — Pages own their panels; removes the three-column scaffold and four entity sidebars

## Architecture

- [App Structure](./architecture/app-structure.md) — Two-context model (picker vs in-tree shell), lifecycle, invariants
- [Overview](./architecture/overview.md) — Layers, data flow, state management
- [Database Schema](./architecture/database-schema.md) — Dual-DB architecture, entity relationships, conventions
- [Data Flow](./architecture/data-flow.md) — How layers communicate (UI → Hooks → Managers → DB)
- [Tech Stack](./architecture/tech-stack.md) — Technologies, versions, rationale
- [Testing Strategy](./architecture/testing-strategy.md) — Philosophy, test layers, conventions

## API

- [Database Layer](./api/database-layer.md) — DB layer contract: connection lifecycle, conventions, module map

## User Interface

- [Design System](./ui/design-system.md) — Radix Themes foundation, brand tokens, design principles, accessibility
- [Layouts](./ui/layouts.md) — Layout modes
- Screens: [Home](./ui/screens/home.md) · [Tree View](./ui/screens/tree-view.md) · [Individual View](./ui/screens/individual-view.md) · [Family View](./ui/screens/family-view.md)

## References

- [GEDCOM 5.5.1 Mapping](./references/gedcom-551-mapping.md) — GEDCOM tag ↔ Vata model correspondences
- [Date Formats](./references/date-formats.md) — Genealogical date formats

## Dev Tools

- [Issue Tracking](./dev-tools/issue-tracking.md) — Issue types, labels, status pipeline, and the `capture-idea` / `link-task` skills
- [Agent Workflow](./dev-tools/agent-workflow.md) — Label-triggered autonomous execution via Sandcastle (ADR-008)
