# Application Structure

> **TL;DR** Vata is a single-tree-at-a-time desktop project editor. The app has two **contexts**: an **outside** picker at URL `/` for choosing and managing tree files, and an **inside** shell at URL `/tree/$treeId/...` for working in one tree. The boundary is enforced by `src/routes/tree/$treeId.tsx`, which opens the tree database on mount and closes it on unmount. Never call `getTreeDb()` from an outside route — it throws.

---

## Mental Model

Vata is in the spirit of desktop project editors like VS Code, Logic Pro, or Final Cut. A genealogical tree is a **project file** (a `.db` SQLite database, in a directory chosen by the user). The picker is a **transit screen**, not a destination — equivalent to a workspace launcher or "File > Open Recent". Once a tree is open, the entire app belongs to that one tree: routes, navigation, command palette, native menu items all reflect a single context.

**Single tree at a time.** No tabs, no multi-window. Closing returns to the picker so the user can pick another.

## The Two Contexts

```text
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

**UI specifics:** see [`docs/ui/screens/home.md`](../ui/screens/home.md) and the _Two Layout Modes_ section of [`docs/ui/layouts.md`](../ui/layouts.md).

## Inside: the In-Tree Shell

**Role:** persistent workspace for one tree. Every route under `/tree/$treeId/...` lives in this context.

**Where it lives:**

- Layout route (the context boundary): `src/routes/tree/$treeId.tsx` — opens the DB before rendering children, closes it on unmount.
- Tree dashboard (in-tree "home"): `src/pages/TreeView.tsx` — the landing page after opening, accessed via the Home button in the top nav.
- Entity routes under `src/routes/tree/$treeId/`: `individuals.tsx`, `families.tsx`, plus detail routes (`individual/$individualId`, `family/$familyId`). Events and Places appear in the nav but have no route yet; Sources and Repositories keep their DB layer (`src/db/trees/`) but no longer have screens.
- Tree DB queries: `src/db/trees/*`.
- DB connection helpers: `src/db/connection.ts` — `getTreeDb()`, `isTreeDbOpen()`, `getCurrentTreePath()`.

**UI specifics:** see the _Two Layout Modes_ section of [`docs/ui/layouts.md`](../ui/layouts.md), plus per-screen docs in `docs/ui/screens/`.

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
