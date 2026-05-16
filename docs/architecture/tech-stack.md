# Tech Stack

This document is a map of the technologies in use. It does **not** reproduce config files (`Cargo.toml`, `tauri.conf.json`, `tsconfig.json`, `vite.config.ts`, `eslint.config.js`, `package.json`, …) — those are the source of truth in the repo. Rationale for the major choices lives in the [ADRs](../adr/).

## Overview

| Category          | Technology        | Version       | Role                                                         |
| ----------------- | ----------------- | ------------- | ------------------------------------------------------------ |
| Desktop framework | Tauri             | 2.x           | Native multi-platform shell                                  |
| Backend           | Rust              | Latest stable | Tauri plugin host (no custom commands yet)                   |
| Frontend          | React             | 18.x          | Declarative UI                                               |
| Language          | TypeScript        | 5.x           | Static typing                                                |
| Bundler           | Vite              | 5.x           | Fast build, HMR                                              |
| Server state      | TanStack Query    | 5.x           | Cache and synchronization                                    |
| Client state      | Zustand           | 4.x           | Lightweight global state, persisted                          |
| Routing           | TanStack Router   | 1.x           | Type-safe file-based routing                                 |
| Database          | SQLite            | 3.x           | Local storage via `@tauri-apps/plugin-sql`                   |
| GEDCOM            | In-app module     | —             | Import/export GEDCOM 5.5.1 (`@vata-apps/gedcom-parser`)      |
| Dates             | In-app module     | —             | Genealogical date parsing/display (`@vata-apps/gedcom-date`) |
| Testing           | Vitest + RTL      | 2.x / 16.x    | Unit and integration tests                                   |
| UI primitives     | Radix UI          | 1.x           | Headless behavior primitives                                 |
| Variants          | tailwind-variants | 3.x           | Type-safe className composition (`tv()`)                     |
| CSS framework     | Tailwind          | 4.x           | Utility-first, CSS-first via `@theme`                        |
| Icons             | Lucide React      | Latest        | Curated icon registry in `icon.tsx`                          |
| i18n              | react-i18next     | Latest        | Internationalization                                         |

## Why these choices

- **Tauri** — chosen over Electron for a smaller bundle, lower RAM, and a strict permission sandbox. The full comparison and decision are in [ADR-001](../adr/0001-desktop-framework.md).
- **React + TypeScript + Vite + TanStack (Query/Router) + Zustand** — the frontend stack and its rationale are in [ADR-002](../adr/0002-frontend-stack.md).
- **Radix + Tailwind v4 + tailwind-variants** — the UI strategy and why headless primitives over a component kit are in [ADR-005](../adr/0005-ui-strategy.md).
- **In-app GEDCOM and date modules** — why genealogy-specific logic is owned in-house rather than pulled from npm is in [ADR-004](../adr/0004-gedcom-libraries.md).

## Tauri plugins

The Rust shell is a plugin-composition layer with no custom commands. Plugins used: `tauri-plugin-sql` (SQLite from the frontend, with transactions), `tauri-plugin-fs` (file I/O for GEDCOM and media), `tauri-plugin-dialog` (native file/confirm dialogs), `tauri-plugin-store` (persistent key/value). Versions and feature flags are in `src-tauri/Cargo.toml`; permissions are in `src-tauri/capabilities/`.

## Non-obvious notes

- **Tailwind v4 is CSS-first.** There is **no `tailwind.config.ts`**. Theme tokens are declared in a `@theme { … }` block in `src/styles/app.css` (in `oklch()`), and light/dark/system theming re-applies private aliases in that same file — never via per-component `dark:` overrides. See [Design System](../ui/design-system.md).
- **Vitest is pinned to v2** for compatibility with Vite 5. Test config is in `vitest.config.ts`, kept separate from `vite.config.ts` to avoid version conflicts.
- **Path aliases** (`$/*`, `$lib/*`, `$db`, …) are documented in `CLAUDE.md` and must be declared in _both_ `vite.config.ts` and `vitest.config.ts`.

## UI wrappers

Custom wrappers live under `src/components/ui/` (e.g. `button.tsx`, `input.tsx`, `icon.tsx`), each composing `tailwind-variants` recipes over Radix primitives, and each shipping a colocated `<name>.stories.tsx` (Storybook + `play()` tests). See [Design System](../ui/design-system.md) and [Storybook](../ui/storybook.md).

## SQLite and i18n

- SQLite access, connection management, and the required PRAGMAs are described in [Database Schema](database-schema.md) and the [Database Layer API](../api/database-layer.md); the code is `src/db/connection.ts`.
- i18n uses `react-i18next` with translations split by namespace under `src/i18n/locales/{en,fr}/`. Config is `src/i18n/config.ts`. All user-facing strings go through `t()`; the database stores only identifiers (see [Database Schema — Internationalization](database-schema.md#internationalization)).
