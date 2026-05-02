# Application Structure

> **TL;DR for AI agents.** Vata is a single-tree-at-a-time desktop project editor. The app has two **contexts**: an **outside** picker at URL `/` for choosing and managing tree files, and an **inside** shell at URL `/tree/$treeId/...` for working in one tree. The boundary is enforced by `src/routes/tree/$treeId.tsx`, which opens the tree database on mount and closes it on unmount. Never call `getTreeDb()` from an outside route — it throws.

---

## Mental Model

Vata is in the spirit of desktop project editors like VS Code, Logic Pro, or Final Cut. A genealogical tree is a **project file** (a `.db` SQLite database, in a directory chosen by the user). The picker is a **transit screen**, not a destination — equivalent to a workspace launcher or "File > Open Recent". Once a tree is open, the entire app belongs to that one tree: routes, navigation, sidebars, command palette, native menu items all reflect a single context.

**Single tree at a time.** No tabs, no multi-window. Closing returns to the picker so the user can pick another.

## The Two Contexts

```
┌────────────────────────────────────────────┐
│  OUTSIDE  (URL: /)                         │
│  Tree picker — pick / create / manage      │
│  No tree DB open                           │
└──────────────┬─────────────────────────────┘
               │ user opens a tree
               ▼ (openTreeDb)
┌────────────────────────────────────────────┐
│  INSIDE  (URL: /tree/$treeId/...)          │
│  In-tree shell — work in one tree          │
│  Tree DB open; getTreeDb() works           │
└──────────────┬─────────────────────────────┘
               │ user closes the tree (⌘W or fallback)
               ▼ (closeTreeDb)
        Back to OUTSIDE
```

**Boot rule.** The app always starts on `/`. No auto-resume of the last-opened tree (deferred decision).

## Outside: the Tree Picker

**Role:** full lifecycle of trees as files — list, open, create, import GEDCOM, rename, delete, export, duplicate.

**Where it lives:**

- Route: `src/routes/index.tsx` → `src/pages/Home.tsx`
- Manager: `src/managers/TreeManager.ts` — `open`, `close`, `create`. Extend here for new operations (rename / delete / duplicate / import / export).
- System DB queries: `src/db/system/trees.ts`

**UI specifics:** see [`docs/ui/screens/home.md`](../ui/screens/home.md) and the _Home Layout_ section of [`docs/ui/layouts.md`](../ui/layouts.md).

## Inside: the In-Tree Shell

**Role:** persistent workspace for one tree. Every route under `/tree/$treeId/...` lives in this context.

**Where it lives:**

- Layout route (the context boundary): `src/routes/tree/$treeId.tsx` — opens the DB before rendering children, closes it on unmount.
- Tree dashboard (in-tree "home"): `src/pages/TreeView.tsx` — the landing page after opening, accessed via the Home icon in the top nav.
- Entity routes under `src/routes/tree/$treeId/`: `individuals.tsx`, `families.tsx`, `sources.tsx`, `repositories.tsx`, `data.tsx`, plus detail routes (`individual/$individualId`, `family/$familyId`, `source/$sourceId`, `repository/$repositoryId`).
- Tree DB queries: `src/db/trees/*`.
- DB connection helpers: `src/db/connection.ts` — `getTreeDb()`, `isTreeDbOpen()`, `getCurrentTreePath()`.

**UI specifics:** see the _Module Layout (Three-Panel)_ section of [`docs/ui/layouts.md`](../ui/layouts.md), plus per-screen docs in `docs/ui/screens/`.

## Lifecycle

### Open

1. User clicks "Open" on a tree card in the picker.
2. Router navigates to `/tree/$treeId/`.
3. `src/routes/tree/$treeId.tsx` fetches the tree row from system DB, then calls `openTreeDb(tree.path)`.
4. Children render (`<Outlet />`) once the DB is ready.
5. When the open is initiated through `TreeManager.open(treeId)`, it also marks `last_opened_at` in system DB and updates the Zustand `currentTreeId`.

### Close

- **Primary (planned):** native macOS menu `File > Close Tree` (`⌘W`). When wired, the menu event maps to a router navigation back to `/` and to `closeTreeDb()`.
- **Effect today:** when the layout route `src/routes/tree/$treeId.tsx` unmounts, its cleanup effect calls `closeTreeDb()`. So navigating away from `/tree/$treeId/...` already closes the tree DB correctly.
- **Fallback affordance** (discrete, not first-class): location TBD during visual work — candidates include the command palette, a Settings menu item, or the tree-name area in the top nav.

### Switch

Not a separate operation. Switching to another tree = close (return to picker) + open (pick another). Maintains single-tree-at-a-time.

## Invariants for AI Agents

Anything that breaks one of these breaks the contract.

1. **Never call `getTreeDb()` from an outside route.** It throws (`"No tree database is currently open"`). Code that reads tree data must live under `/tree/$treeId/...`.
2. **Never bypass `TreeManager`** for tree-level operations (open / close / create / future rename / delete / duplicate / import / export). The manager keeps `closeTreeDb()` and the Zustand `currentTreeId` in sync.
3. **Boot starts at `/`.** Do not add auto-resume of the last tree without an explicit decision (currently a non-goal).
4. **One tree at a time.** Do not add tabs, multi-window, or background "open" of a second tree's DB.
5. **The route `src/routes/tree/$treeId.tsx` owns the DB lifecycle.** Do not open or close the tree DB from page components, hooks, or managers triggered by them; trust the route layout.
6. **Never `SELECT *`** (general SQLite rule, particularly relevant when adding system-DB queries for picker stats — see `docs/architecture/database-schema.md`).

## Where to Look Next

| Question                                                | Doc                                                                                                |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| What does each layout look like in detail?              | [`docs/ui/layouts.md`](../ui/layouts.md)                                                           |
| What's in the picker / tree dashboard / module screens? | [`docs/ui/screens/`](../ui/screens/)                                                               |
| How are layers connected (UI → Hooks → Manager → DB)?   | [`docs/architecture/overview.md`](./overview.md)                                                   |
| What's in `system.db` vs `tree.db`?                     | [`docs/architecture/database-schema.md`](./database-schema.md)                                     |
| What's the database CRUD contract?                      | [`docs/api/database-layer.md`](../api/database-layer.md)                                           |
| Why two databases?                                      | [`docs/decisions/adr-003-database-architecture.md`](../decisions/adr-003-database-architecture.md) |
