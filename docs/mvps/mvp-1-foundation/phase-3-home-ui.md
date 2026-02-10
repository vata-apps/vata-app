# Phase 3: Home UI

## Objective

Create a minimal HTML layout and Home page with tree list functionality. **No Mantine in MVP1** — use HTML-only UI with minimal CSS. Mantine and the design system are added in MVP4.

## Step 3.1: Base Layout

**MVP1**: Minimal HTML layout (header, nav, main). No Mantine AppShell.

**MVP4**: Will be replaced with MainLayout using Mantine AppShell (see MVP4 documentation).

### src/components/layouts/MainLayout.tsx

```typescript
import { Link, useLocation } from '@tanstack/react-router';
import { useAppStore } from '$/store/app-store';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const currentTreeId = useAppStore((s) => s.currentTreeId);
  const location = useLocation();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{ 
        width: sidebarOpen ? '240px' : '60px',
        borderRight: '1px solid #e0e0e0',
        padding: '1rem'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          {sidebarOpen && <h2>Vata</h2>}
          <button onClick={toggleSidebar}>☰</button>
        </div>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {currentTreeId ? (
            <>
              <li><Link to={`/tree/${currentTreeId}`}>Home</Link></li>
              <li><Link to={`/tree/${currentTreeId}/individuals`}>Individuals</Link></li>
              <li><Link to={`/tree/${currentTreeId}/families`}>Families</Link></li>
            </>
          ) : (
            <li><Link to="/">Home</Link></li>
          )}
        </ul>
      </nav>
      <main style={{ flex: 1, padding: '1rem' }}>
        {children}
      </main>
    </div>
  );
}
```

### Validation Criteria

- [ ] Layout displays correctly
- [ ] Sidebar toggle works
- [ ] Navigation works

---

## Step 3.2: Base Home Page

**MVP1**: Simple HTML page (title, buttons, tree list in `<ul>` or `<div>`). No Mantine components.

**MVP4**: Will migrate to Mantine components (Container, Card, Button, etc.).

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

- [ ] Home page displays
- [ ] Tree list loaded
- [ ] UI responsive (basic)

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
├── App.tsx
└── main.tsx
```

### Final Checklist

- [ ] Layout displays correctly
- [ ] Home page displays
- [ ] Tree list loads from database
- [ ] Navigation works
- [ ] Router configured
- [ ] Basic styling applied (HTML/CSS only)
