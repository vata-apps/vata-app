# CLAUDE.md

Vata — a single-tree-at-a-time desktop genealogy editor (think VS Code / Logic Pro).
Tauri 2 (Rust shell) + React 18 + TypeScript + Vite + SQLite (`@tauri-apps/plugin-sql`).
State: TanStack Query v5 (server/DB) + Zustand 4 (client, localStorage). Routing: TanStack Router v1 (file-based).
UI: headless Base UI (`@base-ui/react`) + Vanilla Extract tokens (`src/design/theme.css.ts`) for the new foundation; Radix Themes still coexists for unmigrated screens. Shared behavior-owning primitives live in `src/components/ui/` per ADR-0005.

## Non-negotiables

- **Scope**: do EXACTLY what was asked. No unrequested audits or scope creep. If asked for a multi-agent analysis, launch the agents immediately instead of exploring solo first.
- **Before committing**: run `/simplify` and apply the real findings. Use conventional commit messages.
- **English everywhere** (code, comments, docs, git). User-facing strings go through i18n (`useTranslation`) — never hardcode. Literals are fine in tests and DEV-only debug UI.
- **Tests**: write the strict minimum — most changes ship with none. Only add one when it's genuinely the fastest way to pin down a real regression, and only if the user asks or a subagent's own checklist requires it. Never write tests proactively for coverage.
- **Bug fixes**: reproduce manually first. After one failed fix, switch to root-cause investigation (don't try a second variant blind).

## Architecture

Two contexts, boundary enforced by `src/routes/tree/$treeId.tsx` (opens the tree DB on mount, closes on unmount):

- **Picker** at `/` — no tree DB open; tree-file lifecycle via `TreeManager`.
- **Shell** at `/tree/$treeId/…` — tree DB open, so `getTreeDb()` works.

Two SQLite DBs: `system.db` (tree list, app settings) + one `<tree>.db` per tree. Connection management lives in `src/db/connection.ts` (`getSystemDb`, `openTreeDb`, `getTreeDb`).

Layers: **UI → Hooks (TanStack Query) → Managers (`src/managers/`) → DB (`src/db/`)**. IDs are `INTEGER` in the DB, prefixed strings in TS (`I-`/`F-`/`E-`/`P-`) — convert at DB boundaries via `src/lib/entityId.ts`.

Read [docs/architecture/app-structure.md](./docs/architecture/app-structure.md) before touching routing, the home page, the shell, or DB lifecycle. Domain vocabulary: [CONTEXT.md](./CONTEXT.md).

## Pitfalls

- `routeTree.gen.ts` is auto-generated — never edit it.
- Fragments from `.map()`: use `<React.Fragment key={…}>`, never `<>`.
- Guard debug UI with `import.meta.env.DEV`.
- No placeholder or unused exports — if it isn't needed now, don't create it.
- Debug builds ship `tauri-plugin-mcp-bridge`: you can drive the running app via MCP tools (`webview_*`, `ipc_*`) to verify UI changes.
