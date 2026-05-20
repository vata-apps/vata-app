# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# Scope Discipline

- Do EXACTLY what was requested. Do not explore 'related guidance', do not audit the surrounding codebase, and do not expand scope without asking. If a user asks for a multi-agent analysis, launch the agents immediately rather than exploring first.

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
```

To run a single test file:

```bash
pnpm vitest run src/db/trees/individuals.test.ts
```

---

# Architecture

## Two contexts: picker vs in-tree shell

Vata is a single-tree-at-a-time desktop project editor (think VS Code / Logic Pro). The app has two contexts: the **outside picker** at URL `/`, and the **inside shell** at URL `/tree/$treeId/...`. The boundary is enforced by `src/routes/tree/$treeId.tsx`, which opens the tree DB on mount and closes it on unmount. Read [docs/architecture/app-structure.md](./docs/architecture/app-structure.md) before any work on routing, the home page, the tree shell, or anything that touches `openTreeDb` / `closeTreeDb` / `getTreeDb`.

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
- `/tree/$treeId/individuals` → `src/pages/IndividualsPage.tsx`
- `/tree/$treeId/families` → `src/pages/FamiliesPage.tsx`

The `$treeId.tsx` layout route is responsible for opening the tree DB before any child route renders.

## Managers

`src/managers/` contains orchestration classes that coordinate multiple layers. Currently only `GedcomManager` (static class) handles GEDCOM import/export workflows: file dialog → parse → DB write, and DB read → serialize → file dialog.

## Testing

Test files colocate with source (e.g., `src/db/trees/individuals.test.ts`). Infrastructure in `src/test/`:

- `sqlite-memory.ts` — in-memory SQLite helpers for DB unit tests

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

Uses `react-i18next` + `i18next`. All **client-facing** strings must use `useTranslation()` — never hardcode.

**Client-facing means strings shipped to end users in the desktop app:** UI labels, button text, placeholders, error messages, toasts, confirmations — anything an end user sees in `pnpm tauri:dev` / `pnpm tauri:build`.

**Out of scope (literals are fine):**

- Test files (`*.test.{ts,tsx}`) — assertions and fixtures.
- Developer-only debug UIs guarded by `import.meta.env.DEV`.

If you're not sure whether a surface is client-facing, the test is: _does an end user running the packaged Tauri app see this string?_ If yes, use `t()`. If no, literals are fine.

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

Never commit new work directly to `main`. Every dev task ships as a PR to `main`.

## Step 0 — Decide the work mode (ALWAYS ASK FIRST)

Before any edit on a new task, ask the user: **"simple branch or worktree?"** with a default recommendation. Use `AskUserQuestion` when available, otherwise ask in plain text. Never assume.

**Recommend "simple branch"** when:

- Single-file doc fix or typo
- Trivial config tweak
- Estimated < 5 min, no risk of context-switch

**Recommend "worktree"** when:

- Multi-file change (>3 files) or cross-layer work
- New feature, refactor, DB migration
- Long task likely to span sessions or be interrupted
- Need to keep `main` clean for parallel work

## Branch Hygiene

- Always branch from an up-to-date main. Before starting work, fetch and verify main is current. Never start work on a stale base.

## Step 1 — Sync `main`, then create the branch/worktree

Every new branch and every new worktree MUST start from a `main` synced with `origin/main`. Exception: branch off something else only when the user explicitly says so; ask if unclear.

From any branch, with a clean working tree:

```bash
git checkout main
git pull --ff-only origin main
```

If the working tree has uncommitted changes or `main` cannot fast-forward, stop and ask the user — never stash, reset, or discard their work to satisfy this rule.

### Simple branch mode

```bash
git checkout -b <type>/<short-desc>
# ...edit, commit, push, PR
```

### Worktree mode

**ALWAYS use the `EnterWorktree` tool. NEVER use `git worktree add` via Bash. NEVER use the `superpowers:using-git-worktrees` skill** — its `git worktree add` approach bypasses the session lifecycle that `ExitWorktree` relies on.

`EnterWorktree` branches from current `HEAD`, so call it with `main` checked out (the sync above guarantees this).

## Branch naming

Aligned with conventional commits:

- `feat/<short-desc>` — new feature
- `fix/<short-desc>` — bug fix
- `refactor/<short-desc>` — refactor
- `docs/<short-desc>` — documentation
- `chore/<short-desc>` — config/tooling
- `test/<short-desc>` — tests only
- `perf/<short-desc>` — performance work

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

## After merge

- If worktree: call `ExitWorktree` to clean up the session-registered worktree.
- Delete the local branch (`git branch -d <branch>`) once merged.
- **Stop monitoring the PR.** Do not push "nudge" commits and do not recreate a deleted branch. Once the PR is merged, the work is done — wait for the next user instruction.

---

# Post-Merge Behavior

- Once a PR is merged, STOP. Do not push nudge commits, and do not resurrect deleted branches. Consider the work complete.

---

# Pre-PR Review

Before creating a pull request (via `gh pr create`, any slash command that opens a PR, or any other means), the agent MUST:

1. Run `/simplify` to launch the three-agent reuse / quality / efficiency review on the branch diff. Apply the fixes that are real issues; skip false positives and stylistic nits.
2. Then run `/review` locally and address the real findings.
3. Create the PR.

---

# Research & Bug Fixes

## Research / analysis requests

When the user asks for research, analysis, or "look at how X compares to Y", **dispatch the requested agents in the first turn**. Do not start by exploring the codebase solo — that re-does work the agents will do, and burns context. If the request is ambiguous about parallelism (e.g. "look into X"), default to launching one or more `Explore` / `general-purpose` agents in parallel rather than reading files yourself.

## Scope confirmation

Before executing on a multi-step refactor or "remove X" task, restate the scope back in one line. Phrasings like "rename A to B" can mean either a literal rename or a full conceptual removal — confirm if there's any doubt instead of guessing.

## Bug fixes — root cause first

When fixing a bug:

1. **Reproduce first.** Write a failing test (or a reliable manual repro) that captures the bug _before_ touching any production code.
2. **Diagnose before patching.** If the first fix doesn't work, stop iterating on variants and investigate the actual code path / runtime / build pipeline. Symptoms vs. cause: debounce / memoize / N+1 cleanup is rarely the root cause of "the UI freezes".
3. **One swing rule.** After one failed fix, switch to root-cause investigation (often via a `general-purpose` or `Explore` agent) instead of trying a second variant.

---

# Common Pitfalls

- **Path Aliases**: `$db` is bare (no sub-paths). Within `src/db/`, use relative imports. From outside, use `$/db/connection`, `$db-system/*`, `$db-tree/*`. All aliases must exist in both `vite.config.ts` AND `vitest.config.ts`.
- **React Lists**: When returning a Fragment from `.map()`, always use `<React.Fragment key={...}>`, never `<>`. Key must be on the outermost element.
- **Debug UI**: Guard with `{import.meta.env.DEV && (...)}`. Never ship debug panels to production.
- **No Unused Exports**: Do not pre-create hooks, functions, or components for future use.

---

# Manual Testing with Tauri MCP Bridge

The app includes `tauri-plugin-mcp-bridge` (debug builds only). You can launch the app with `pnpm tauri:dev` and interact with it directly using the MCP tools (`webview_screenshot`, `webview_interact`, `webview_find_element`, `ipc_execute_command`, etc.) to verify UI changes, test workflows, and inspect state — no manual user intervention needed.

---

# Available Skills

The following specialized skills are loaded automatically when relevant, or on demand via the skill tool.

| Skill                     | Trigger                                                                                                                                                                 |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sqlite-standards`        | When writing `src/db/**`, SQL, migrations, scaffolding a new entity's DB layer, or DB-related docs                                                                      |
| `gedcom-standards`        | When writing `src/lib/gedcom/**`, GEDCOM docs, or XREF/tag code                                                                                                         |
| `typescript-standards`    | When writing `src/**/*.{ts,tsx}` (components, hooks, managers, store, routes)                                                                                           |
| `tauri-standards`         | When writing `src-tauri/**/*.rs` or `tauri.conf.json`                                                                                                                   |
| `testing-standards`       | When writing `**/*.{test,spec}.{ts,tsx}` — Vitest unit/integration conventions, in-memory SQLite for the DB layer                                                       |
| `new-route`               | When adding a new page or entity view under `/tree/$treeId/`                                                                                                            |
| `design-system-standards` | When designing or reviewing UI under `src/components/**` or `src/pages/**` — when to reuse a Radix Themes component, compose primitives, or add an application organism |

The UI foundation is [Radix Themes](https://www.radix-ui.com/themes) (`@radix-ui/themes`), consumed directly — `import { Button, Dialog, Flex } from '@radix-ui/themes'`. There is no `src/components/ui/` wrapper layer; internal components under `src/components/` are reserved for application organisms (`tree-shell.tsx`, `tree-nav.tsx`, `app-status-bar.tsx`, …). Brand tokens (`accentColor`, `grayColor`, `radius`) are set on the `<Theme>` provider in `src/components/app-theme.tsx`; the Lucide icon registry lives at `src/components/icon.tsx`. See `docs/ui/design-system.md` and [ADR-007](./docs/adr/0007-adopt-radix-themes.md).

---

# Available Agents

The following agents can be dispatched as sub-agents for autonomous tasks.

| Agent                  | When to Dispatch                                                                                                                                     |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs-consistency`     | After any change to `docs/*.md` — validates cross-references and consistency                                                                         |
| `code-reviewer`        | After implementing a feature — reviews code against project standards                                                                                |
| `test-writer`          | Before implementing a feature — writes behavioral tests (TDD red phase)                                                                              |
| `design-system-expert` | When planning a feature/page from a mockup (Pencil `.pen`, image, text, route file), or when auditing the DS for duplication, dead components, drift |
