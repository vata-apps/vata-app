# Vata

> **Vata** (वट, *vaṭa*) is the Sanskrit word for the banyan tree (*Ficus benghalensis*) — a tree whose aerial roots descend from its branches to form new trunks, expanding endlessly. A fitting name for a genealogy app.

A modern, local-first desktop application for managing genealogical family trees.

Your data stays on your machine. No account, no cloud, no subscription.

## Features

- **Tree management** — Create, open, rename, and delete family trees
- **GEDCOM 5.5.1** — Import and export standard genealogy files for interoperability with other software
- **Individuals & families** — Full CRUD for persons, names, family relationships, events, and places
- **Date handling** — GEDCOM-compliant date parsing and formatting (exact, ranges, periods, approximate)
- **Local SQLite storage** — One database file per tree, fast and portable
- **Cross-platform** — Windows, macOS, and Linux via Tauri

## Tech Stack

| Layer    | Technology                                          |
| -------- | --------------------------------------------------- |
| Shell    | [Tauri 2](https://v2.tauri.app/) (Rust)             |
| Frontend | React 18 + TypeScript 5 + Vite                      |
| Database | SQLite via `@tauri-apps/plugin-sql`                  |
| State    | Zustand (client) + TanStack Query (server)           |
| Routing  | TanStack Router (file-based)                         |
| Tests    | Vitest + Testing Library                             |

## Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [pnpm](https://pnpm.io/) >= 9
- [Rust](https://www.rust-lang.org/tools/install) (stable)
- Tauri system dependencies — see the [Tauri prerequisites guide](https://v2.tauri.app/start/prerequisites/)

## Getting Started

```bash
# Clone the repository
git clone https://github.com/stivaugoin/vata-app.git
cd vata-app

# Install dependencies
pnpm install

# Run the desktop app in development mode
pnpm tauri:dev
```

The app opens a native window. A `system.db` file is created automatically on first launch.

## Scripts

| Command              | Description                          |
| -------------------- | ------------------------------------ |
| `pnpm tauri:dev`     | Full Tauri desktop app (dev mode)    |
| `pnpm dev`           | Vite dev server only (port 1420)     |
| `pnpm build`         | TypeScript check + Vite build        |
| `pnpm tauri:build`   | Build distributable desktop app      |
| `pnpm test`          | Run tests in watch mode              |
| `pnpm test:coverage` | Run tests with coverage report       |
| `pnpm lint`          | ESLint check                         |
| `pnpm lint:fix`      | ESLint auto-fix                      |
| `pnpm format`        | Prettier format                      |
| `pnpm format:check`  | Prettier check                       |

## Architecture

```
UI (React pages & components)
  -> Hooks (TanStack Query, cache, mutations)
    -> Managers (validation, orchestration, transactions)
      -> DB layer (SQLite CRUD, type mapping)
        -> Tauri IPC -> SQLite
```

The app uses a **two-database design**:

- **system.db** — App-level metadata (tree list, settings)
- **\<tree-name\>.db** — All genealogical data for one family tree

See [`docs/architecture/overview.md`](docs/architecture/overview.md) for the full architecture documentation.

## Project Structure

```
src/
  components/     # Reusable UI components
  db/
    system/       # System database (tree list, settings)
    trees/        # Tree database (individuals, families, events, places)
  gedcom-date/    # In-app GEDCOM date parsing module
  gedcom-parser/  # In-app GEDCOM file parsing module
  hooks/          # TanStack Query hooks
  lib/            # Utilities (entity IDs, etc.)
  managers/       # Business logic orchestration
  pages/          # Full-screen page components
  routes/         # File-based route definitions
  store/          # Zustand stores
  test/           # Test infrastructure and mocks
  types/          # Shared TypeScript types
src-tauri/        # Rust backend (Tauri shell, plugins)
docs/             # Product specs, architecture, decisions
```

## Roadmap

| MVP | Name             | Status      |
| --- | ---------------- | ----------- |
| 1   | Foundation       | Complete    |
| 2   | GEDCOM           | Complete    |
| 3   | Primary Entities | Complete    |
| 4   | Sources          | Not Started |
| 5   | Files            | Not Started |
| 6   | UI (shadcn/ui)   | Not Started |

See [`docs/product/roadmap.md`](docs/product/roadmap.md) for details and [`docs/product/prd.md`](docs/product/prd.md) for the full product requirements.

## Documentation

All project documentation lives in [`docs/`](docs/):

- [Product Requirements](docs/product/prd.md)
- [Architecture Overview](docs/architecture/overview.md)
- [Tech Stack](docs/architecture/tech-stack.md)
- [Architecture Decision Records](docs/decisions/)
- [MVP Specs](docs/mvps/)