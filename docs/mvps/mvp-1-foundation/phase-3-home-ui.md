# Phase 3: Home UI

## Objective

Create a minimal HTML layout and Home page with tree list functionality. **No UI library in MVP1** — use HTML-only UI with minimal CSS. shadcn/ui and the design system are added in MVP4.

## Step 3.1: Base Layout

**MVP1**: Minimal HTML layout (header, nav, main). No shadcn/ui components.

**MVP4**: Will be replaced with MainLayout using shadcn/ui layout components (see MVP4 documentation).

### src/components/layouts/MainLayout.tsx

Minimal wrapper — navigation is handled per-page (e.g. `TreeView.tsx` has its own sidebar).

```typescript
interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return <div style={{ minHeight: '100vh' }}>{children}</div>;
}
```

### Validation Criteria

- [x] Layout displays correctly
- [x] Sidebar toggle works
- [x] Navigation works

---

## Step 3.2: Base Home Page

**MVP1**: Simple HTML page (title, buttons, tree list in `<ul>` or `<div>`). No UI library components.

**MVP4**: Will migrate to shadcn/ui components (Card, Button, Dialog, etc.).

### src/pages/Home.tsx

```typescript
import { useQuery } from '@tanstack/react-query';
import { getAllTrees } from '$/db/system/trees';
import { queryKeys } from '$lib/query-keys';

export function HomePage() {
  const { data: trees, isLoading } = useQuery({
    queryKey: queryKeys.trees,
    queryFn: getAllTrees,
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1>Vata</h1>
        <p>Genealogical tree management</p>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <button style={{ marginRight: '1rem', padding: '0.5rem 1rem' }}>
          New Tree
        </button>
        <button style={{ padding: '0.5rem 1rem' }}>
          Import GEDCOM
        </button>
      </div>

      {isLoading ? (
        <p style={{ textAlign: 'center' }}>Loading...</p>
      ) : trees && trees.length > 0 ? (
        <>
          <h2>Your Trees</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem'
          }}>
            {trees.map((tree) => (
              <div key={tree.id} style={{ 
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                padding: '1rem'
              }}>
                <h3>{tree.name}</h3>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>
                  {tree.individualCount} individuals · {tree.familyCount} families
                </p>
                <button style={{ width: '100%', marginTop: '1rem', padding: '0.5rem' }}>
                  Open
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p style={{ textAlign: 'center', color: '#666' }}>
          No trees. Create your first tree or import a GEDCOM file.
        </p>
      )}
    </div>
  );
}
```

### Validation Criteria

- [x] Home page displays
- [x] Tree list loaded
- [x] UI responsive (basic)

---

## Step 3.2b: Rename Tree (inline form on card)

Adds rename functionality to each tree card. When the user clicks "Rename", an inline form replaces the tree name with an input field pre-filled with the current name. On submit, calls `updateTree()` and refreshes the list.

**Behavior:**
- "Rename" button on each card opens an inline edit form (replaces the card's name heading)
- Input pre-filled with the current name, required, trimmed
- "Save" button submits; "Cancel" reverts to display mode
- On success: invalidate the `trees` query, close the form

### Validation Criteria

- [x] Rename button visible on each tree card
- [x] Input pre-filled with current name
- [x] Cancel reverts to display mode without saving
- [x] Save updates the name in `system.db` and reflects on the card

---

## Step 3.3: Router Setup

### src/main.tsx

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';

import { queryClient } from './lib/query-client';
import { routeTree } from './routeTree.gen';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
```

### src/routes/__root.tsx

```typescript
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { MainLayout } from '$components/layouts/MainLayout';

export const Route = createRootRoute({
  component: () => (
    <MainLayout>
      <Outlet />
    </MainLayout>
  ),
});
```

### src/routes/index.tsx

```typescript
import { createFileRoute } from '@tanstack/react-router';
import { HomePage } from '$pages/Home';

export const Route = createFileRoute('/')({
  component: HomePage,
});
```

---

## Phase 3 Deliverables

### Files Created

```
src/
├── components/
│   └── layouts/
│       └── MainLayout.tsx
├── pages/
│   └── Home.tsx
├── routes/
│   ├── __root.tsx
│   └── index.tsx
└── main.tsx
```

> Note: `src/App.tsx` is not created. `main.tsx` handles the router setup directly.

### Final Checklist

- [x] Layout displays correctly
- [x] Home page displays
- [x] Tree list loads from database
- [x] Create tree works
- [x] Open tree works
- [x] Rename tree works
- [x] Delete tree works
- [x] Navigation works
- [x] Router configured
- [x] Basic styling applied (HTML/CSS only)
