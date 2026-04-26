# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# Commands

```bash
# Development
pnpm dev              # Vite dev server only (port 1420)
pnpm tauri:dev        # Full Tauri desktop app in dev mode (preferred)

# Build
pnpm build            # TypeScript check + Vite production build
pnpm tauri:build      # Build distributable desktop app

# Lint & format
pnpm lint             # ESLint check
pnpm lint:fix         # ESLint auto-fix
pnpm format           # Prettier write
pnpm format:check     # Prettier check

# Tests
pnpm test             # Vitest watch mode
pnpm test:coverage    # Coverage report (v8)

# Review
pnpm review           # CodeRabbit local review (uncommitted changes)
pnpm review:all       # CodeRabbit full branch review (before PR)
```

To run a single test file:

```bash
pnpm vitest run src/db/trees/individuals.test.ts
```

---

# Architecture

## Tech Stack

Tauri 2 (Rust shell) + React 18 + TypeScript + Vite + SQLite (`@tauri-apps/plugin-sql`). State: Zustand 4 (localStorage). Data fetching: TanStack Query v5. Routing: TanStack Router v1 (file-based). Tests: Vitest + jsdom.

## Two-Database Design

The app maintains two SQLite databases simultaneously:

| Database  | File             | Purpose                                     |
| --------- | ---------------- | ------------------------------------------- |
| System DB | `system.db`      | App-level metadata: tree list, app settings |
| Tree DB   | `<tree-name>.db` | All genealogical data for one family tree   |

Connection management lives in `src/db/connection.ts`. Key functions:

- `getSystemDb()` — opens/initializes system DB on first call
- `openTreeDb(filename)` — opens a tree-specific DB
- `getTreeDb()` — returns the active tree DB (throws if none open)

Every connection gets PRAGMAs applied: WAL mode, foreign keys ON, busy timeout 5000ms, etc.

## Tree DB Schema (core tables)

`individuals` → `names` (one person can have multiple names; `is_primary` flags the canonical one)
`families` → `family_members` (roles: husband/wife/child; with pedigree type)
`events` → `event_participants` (roles: principal/witness/officiant)
`events` → `places` (optional location; places are hierarchical via `parent_id`)
`place_types`, `event_types` — system-defined or custom lookup tables
`tree_meta` — key/value schema version and software metadata

## Entity ID Convention

Database stores `INTEGER` primary keys. The UI and all TypeScript types use formatted string IDs:

| Prefix | Entity     | Example  |
| ------ | ---------- | -------- |
| `I`    | Individual | `I-0001` |
| `F`    | Family     | `F-0002` |
| `E`    | Event      | `E-0003` |
| `P`    | Place      | `P-0004` |

Conversion happens at DB layer boundaries via `src/lib/entityId.ts`:

- `formatEntityId('I', 1)` → `'I-0001'`
- `parseEntityId('I-0001')` → `1`

## DB Layer Pattern

Each file in `src/db/trees/` and `src/db/system/` follows this structure:

1. `Raw*` type — snake_case fields matching DB columns
2. Public domain type — camelCase fields used throughout the app
3. `mapRaw*(raw)` — converts raw → public type
4. Exported CRUD functions — receive/return public types, never raw rows
5. Always select explicit columns (no `SELECT *`)

## Path Aliases

| Alias           | Resolves to        |
| --------------- | ------------------ |
| `$/*`           | `src/*`            |
| `$lib/*`        | `src/lib/*`        |
| `$components/*` | `src/components/*` |
| `$hooks/*`      | `src/hooks/*`      |
| `$managers`     | `src/managers`     |
| `$db`           | `src/db`           |
| `$db-system/*`  | `src/db/system/*`  |
| `$db-tree/*`    | `src/db/trees/*`   |
| `$types`        | `src/types`        |

## Routing

File-based routing via TanStack Router. `routeTree.gen.ts` is auto-generated — never edit it manually. Route files live in `src/routes/`.

Active routes:

- `/` → `src/routes/index.tsx` → `src/pages/Home.tsx`
- `/tree/$treeId` → `src/routes/tree/$treeId.tsx` (loads tree metadata, opens DB)
- `/tree/$treeId/` → `src/pages/TreeView.tsx`
- `/tree/$treeId/data` → `src/pages/DataBrowser.tsx`

The `$treeId.tsx` layout route is responsible for opening the tree DB before any child route renders.

## Managers

`src/managers/` contains orchestration classes that coordinate multiple layers. Currently only `GedcomManager` (static class) handles GEDCOM import/export workflows: file dialog → parse → DB write, and DB read → serialize → file dialog.

## Testing

Test files colocate with source (e.g., `src/db/trees/individuals.test.ts`). Infrastructure in `src/test/`:

- `sqlite-memory.ts` — in-memory SQLite helpers for DB unit tests
- `mocks/plugin-sql.ts` — mock for Tauri SQL plugin (used in non-Tauri test environments)

---

# English Only

Everything in this project must be written in English.

## Scope

- **Code**: Variable names, function names, class names, comments, JSDoc
- **Documentation**: README, docs, architecture notes, API descriptions
- **Strings**: User-facing messages, error messages, logs, UI labels — **must use i18n**, never hardcode
- **Tests**: Test descriptions, assertion messages, test file names
- **Git**: Commit messages, PR titles, branch names

## i18n for User-Facing Strings

Uses `react-i18next` + `i18next`. All user-facing strings must use `useTranslation()` — never hardcode.

- Config: `src/i18n/config.ts`
- Translations: `src/i18n/locales/{en,fr}/<namespace>.json`
- Namespaces: `common` (shared), plus one per entity (e.g., `individuals`, `sources`)
- Language detection: `navigator.language` → localStorage override

---

# No SELECT \*

Never use `SELECT *` in SQL. Always list the columns you need explicitly.

Applies to any SQL: raw strings, query builders (e.g. Drizzle, Kysely), migrations, and documentation examples.

```typescript
// ❌ BAD (Drizzle-style)
const rows = await db.select().from(individuals);

// ✅ GOOD
const rows = await db
  .select({
    id: individuals.id,
    givenName: individuals.givenName,
    surname: individuals.surname,
  })
  .from(individuals);
```

---

# Git Workflow

## Worktree + PR

All new development must be done in a **git worktree** on a dedicated feature branch, then submitted as a **pull request**. Never commit new work directly to `main`.

1. Create a worktree with a feature branch
2. Do all work in the isolated worktree
3. Commit, push, and open a PR to `main`

## Granular Commits

Commit early and often. Each commit should represent a single, complete unit of work that can be reverted independently.

## Commit Message Format

Use conventional commits:

```
feat: add birth date picker to individual form
fix: prevent duplicate family relationships
refactor: extract date formatting to utility
test: add coverage for GEDCOM date parsing
docs: update database schema documentation
chore: upgrade drizzle-orm to 0.30.0
```

---

# Pre-PR Review

Before creating a pull request (via `gh pr create`, any slash command that opens a PR, or any other means), the agent MUST:

1. Run `pnpm review:all` to get a CodeRabbit local review of the full branch diff.
2. Read the output and address any **critical** or **high** severity findings in new commits on the branch.
3. Re-run `pnpm review:all` if meaningful fixes were made.
4. Only then proceed to create the PR.

Low-severity / nitpick findings do not need to be addressed locally — let CodeRabbit raise them on the PR if it still sees them. The goal is to catch the issues that would otherwise trigger 5+ review rounds, not to reach a zero-finding local state.

If `coderabbit` CLI is not installed (command not found), skip this step and note it in the PR description so Steve knows to install it. Do NOT block the PR on tooling that isn't set up.

---

# Common Pitfalls

- **Path Aliases**: `$db` is bare (no sub-paths). Within `src/db/`, use relative imports. From outside, use `$/db/connection`, `$db-system/*`, `$db-tree/*`. All aliases must exist in both `vite.config.ts` AND `vitest.config.ts`.
- **React Lists**: When returning a Fragment from `.map()`, always use `<React.Fragment key={...}>`, never `<>`. Key must be on the outermost element.
- **Modal Dialogs**: Every modal must have `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and an Escape key handler.
- **Debug UI**: Guard with `{import.meta.env.DEV && (...)}`. Never ship debug panels to production.
- **No Unused Exports**: Do not pre-create hooks, functions, or components for future use.

---

# Manual Testing with Tauri MCP Bridge

The app includes `tauri-plugin-mcp-bridge` (debug builds only). You can launch the app with `pnpm tauri:dev` and interact with it directly using the MCP tools (`webview_screenshot`, `webview_interact`, `webview_find_element`, `ipc_execute_command`, etc.) to verify UI changes, test workflows, and inspect state — no manual user intervention needed.

---

# Available Skills

The following specialized skills are loaded automatically when relevant, or on demand via the skill tool.

| Skill                  | Trigger                                                                       |
| ---------------------- | ----------------------------------------------------------------------------- |
| `sqlite-standards`     | When writing `src/db/**`, SQL queries, migrations, or DB-related docs         |
| `gedcom-standards`     | When writing `src/lib/gedcom/**`, GEDCOM docs, or XREF/tag code               |
| `docs-consistency`     | After any change to `docs/*.md`                                               |
| `typescript-standards` | When writing `src/**/*.{ts,tsx}` (components, hooks, managers, store, routes) |
| `tauri-standards`      | When writing `src-tauri/**/*.rs` or `tauri.conf.json`                         |
| `testing-standards`    | When writing `**/*.{test,spec}.{ts,tsx}` or setting up test infrastructure    |
| `db-layer`             | When creating a new entity's DB operations in `src/db/trees/`                 |
| `new-route`            | When adding a new page or entity view under `/tree/$treeId/`                  |

---

# Available Agents

The following agents can be dispatched as sub-agents for autonomous tasks.

| Agent              | When to Dispatch                                                             |
| ------------------ | ---------------------------------------------------------------------------- |
| `docs-consistency` | After any change to `docs/*.md` — validates cross-references and consistency |
| `code-reviewer`    | After implementing a feature — reviews code against project standards        |
| `test-writer`      | Before implementing a feature — writes behavioral tests (TDD red phase)      |
