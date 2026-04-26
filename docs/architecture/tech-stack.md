# Tech Stack

## Overview

| Category          | Technology      | Version       | Role                                                         |
| ----------------- | --------------- | ------------- | ------------------------------------------------------------ |
| Desktop Framework | Tauri           | 2.0           | Native multi-platform shell                                  |
| Backend           | Rust            | Latest stable | Tauri plugins                                                |
| Frontend          | React           | 18.x          | Declarative UI                                               |
| Language          | TypeScript      | 5.x           | Static typing                                                |
| Bundler           | Vite            | 5.x           | Fast build, HMR                                              |
| State (Server)    | TanStack Query  | 5.x           | Cache and synchronization                                    |
| State (Client)    | Zustand         | 4.x           | Lightweight global state                                     |
| Routing           | TanStack Router | 1.x           | Type-safe routing                                            |
| Database          | SQLite          | 3.x           | Local storage                                                |
| GEDCOM            | In-app module   | —             | Import/export GEDCOM 5.5.1 (`@vata-apps/gedcom-parser`)      |
| Dates             | In-app module   | —             | Genealogical date parsing/display (`@vata-apps/gedcom-date`) |
| Testing           | Vitest + RTL    | 2.x / 16.x    | Unit and integration tests                                   |
| UI Components     | shadcn/ui       | Latest        | Radix UI primitives with Tailwind CSS styling                |
| CSS Framework     | Tailwind CSS    | 4.x           | Utility-first CSS framework                                  |
| Icons             | Lucide React    | Latest        | Consistent iconography                                       |
| i18n              | react-i18next   | 15.x          | Internationalization                                         |

---

## Tauri 2.0

### Why Tauri Over Electron?

| Criterion   | Tauri                       | Electron         |
| ----------- | --------------------------- | ---------------- |
| Bundle size | ~3-10 MB                    | ~150+ MB         |
| RAM usage   | ~30-50 MB                   | ~100-300 MB      |
| Startup     | < 1s                        | 2-5s             |
| Security    | Strict sandbox, permissions | More permissive  |
| WebView     | Native (WebKit/WebView2)    | Chromium bundled |

### Tauri Plugins Used

```toml
# src-tauri/Cargo.toml
[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-sql = { version = "2", features = ["sqlite"] }
tauri-plugin-fs = "2"
tauri-plugin-dialog = "2"
tauri-plugin-store = "2"
```

**tauri-plugin-sql**

- SQLite access from the frontend
- Transaction support
- Statement preparation

**tauri-plugin-fs**

- File reading/writing
- Local file system access
- Required for GEDCOM import/export

**tauri-plugin-dialog**

- Native dialog boxes
- File selection
- Confirmations

**tauri-plugin-store**

- Persistent key-value storage
- User preferences
- Alternative to localStorage

### Tauri Configuration

```json
// src-tauri/tauri.conf.json
{
  "productName": "Vata",
  "version": "0.1.0",
  "identifier": "app.vata.genealogy",
  "build": {
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "title": "Vata - Genealogy",
        "width": 1280,
        "height": 800,
        "minWidth": 800,
        "minHeight": 600,
        "resizable": true,
        "fullscreen": false
      }
    ],
    "security": {
      "csp": "default-src 'self'; style-src 'self' 'unsafe-inline'"
    }
  },
  "plugins": {
    "sql": {
      "preload": ["sqlite:system.db"]
    }
  }
}
```

---

## React 18

### Why React?

- Mature and vast ecosystem
- Excellent documentation
- Large community (support, resources)
- Compatible with Tauri
- Performance with Concurrent Mode

### Component Structure

```
src/components/
├── common/                 # Generic components
│   ├── Button/
│   ├── ConfirmDialog/      # In-window confirmation dialogs (unsaved changes, delete)
│   ├── Form/
│   └── ...
├── individual/            # Person-specific components
│   ├── PersonCard/
│   ├── PersonForm/
│   ├── PersonList/
│   └── ...
├── family/               # Family components
├── event/                # Event components
├── source/               # Source components
└── tree/                 # Tree visualization

src/pages/standalone/       # Form window pages (loaded in native windows, no MainLayout)
├── ImportGedcomForm.tsx
├── ExportGedcomForm.tsx
└── ...
```

> **Note:** Create/edit form UIs are standalone window pages rendered under `/standalone/` routes. They open as native Tauri windows without MainLayout. In-window confirmation dialogs (`ConfirmDialog`) are used for unsaved-change prompts and delete confirmations within those windows.

### Conventions

- Functional components only
- Hooks for logic
- Typed props with interfaces
- No prop drilling (Zustand for shared state)

---

## TypeScript 5

### Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "$/*": ["src/*"],
      "$lib/*": ["src/lib/*"],
      "$components/*": ["src/components/*"],
      "$hooks/*": ["src/hooks/*"],
      "$managers": ["src/managers"],
      "$db": ["src/db"],
      "$db-system/*": ["src/db/system/*"],
      "$db-tree/*": ["src/db/trees/*"],
      "$types": ["src/types"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Path Aliases

| Alias           | Path               | Usage           |
| --------------- | ------------------ | --------------- |
| `$/*`           | `src/*`            | General imports |
| `$lib/*`        | `src/lib/*`        | Utilities       |
| `$components/*` | `src/components/*` | UI components   |
| `$hooks/*`      | `src/hooks/*`      | Custom hooks    |
| `$managers`     | `src/managers`     | Business logic  |
| `$db`           | `src/db`           | Database layer  |
| `$types`        | `src/types`        | Shared types    |

---

## Vite 5

### Why Vite?

- Instant startup (native ESM)
- Ultra-fast HMR
- Simple configuration
- Native TypeScript support
- Optimized for Tauri

### Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      $: path.resolve(__dirname, './src'),
      $lib: path.resolve(__dirname, './src/lib'),
      $components: path.resolve(__dirname, './src/components'),
      $hooks: path.resolve(__dirname, './src/hooks'),
      $managers: path.resolve(__dirname, './src/managers'),
      $db: path.resolve(__dirname, './src/db'),
      $types: path.resolve(__dirname, './src/types'),
    },
  },
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: ['es2021', 'chrome100', 'safari13'],
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});
```

---

## shadcn/ui

### Why shadcn/ui?

- Components copied into the project (`src/components/ui/`) — full ownership
- Built on accessible Radix UI primitives
- Styled with Tailwind CSS utility classes
- Only install components you need — no monolithic dependency
- Excellent TypeScript support
- Widely adopted in the React ecosystem

### How It Works

shadcn/ui is **not an npm package**. It is a CLI tool that copies component source code into your project:

```bash
# Initialize shadcn/ui (one-time setup)
npx shadcn@latest init

# Add individual components as needed
npx shadcn@latest add button card dialog table
```

Components are placed in `src/components/ui/` and can be freely modified.

### Theming

Theme is defined via CSS variables in `src/index.css` and mapped in `tailwind.config.ts`:

```css
/* src/index.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    /* ... */
  }
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... */
  }
}
```

### Key Components Used

| Component         | Usage                                          |
| ----------------- | ---------------------------------------------- |
| Layout (custom)   | Main layout with sidebar navigation            |
| `Dialog`          | Confirmations, forms (unsaved changes, delete) |
| `Table`           | Data lists                                     |
| `Input`, `Select` | Forms                                          |
| `Card`            | Person/event cards                             |
| `Tabs`            | Secondary navigation                           |
| `Sonner` (toast)  | User feedback                                  |
| `DropdownMenu`    | Context menus                                  |
| `Breadcrumb`      | Breadcrumb navigation                          |

---

## TanStack Query 5

### Why TanStack Query?

- Intelligent cache with invalidation
- Automatic loading/error management
- Refetch on focus/reconnection
- Optimistic mutations
- Excellent DevTools

### Configuration

```typescript
// src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false, // No server, no need
    },
    mutations: {
      retry: 0,
    },
  },
});
```

### Patterns Used

```typescript
// Keys centralized in queryKeys, never hardcoded (see overview.md and data-flow.md)
import { queryKeys } from '$lib/query-keys';

// Read hook
export function useIndividuals() {
  return useQuery({
    queryKey: queryKeys.individuals,
    queryFn: () => IndividualManager.getAll(),
  });
}

// Mutation hook
export function useCreateIndividual() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIndividualInput) => IndividualManager.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.individuals });
    },
  });
}

// Selective invalidation
queryClient.invalidateQueries({ queryKey: queryKeys.individual(id) });
queryClient.invalidateQueries({ queryKey: queryKeys.individuals });
```

---

## Zustand 4

### Why Zustand?

- Minimalist API
- No boilerplate
- Native TypeScript
- No Provider needed
- Easy persistence

### Main Store

```typescript
// src/store/app-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // State
  currentTreeId: string | null;
  theme: 'light' | 'dark' | 'system';
  recentTrees: string[];

  // Actions
  setCurrentTree: (id: string | null) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  addRecentTree: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentTreeId: null,
      theme: 'system',
      recentTrees: [],

      setCurrentTree: (id) => set({ currentTreeId: id }),
      setTheme: (theme) => set({ theme }),
      addRecentTree: (id) =>
        set((state) => ({
          recentTrees: [id, ...state.recentTrees.filter((t) => t !== id)].slice(0, 5),
        })),
    }),
    {
      name: 'vata-app-storage',
    }
  )
);
```

---

## TanStack Router

### Why TanStack Router?

- End-to-end type-safe
- Typed params and search params
- Built-in loaders
- Compatible with React 18
- Excellent DevTools

### Route Structure

```typescript
// src/routes/__root.tsx
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { MainLayout } from '$components/layouts/MainLayout';

export const Route = createRootRoute({
  component: () => (
    <MainLayout>
      <Outlet />
    </MainLayout>
  ),
});

// src/routes/index.tsx
export const Route = createFileRoute('/')({
  component: HomePage,
});

// src/routes/tree/$treeId/index.tsx
export const Route = createFileRoute('/tree/$treeId/')({
  component: TreeViewPage,
  loader: ({ params }) => TreeManager.getById(params.treeId),
});

// src/routes/tree/$treeId/individual/$individualId.tsx
export const Route = createFileRoute('/tree/$treeId/individual/$individualId')({
  component: IndividualViewPage,
  loader: ({ params }) => IndividualManager.getById(params.individualId),
});
```

---

## Internationalization (i18n)

### Why react-i18next?

- Most widely used React i18n library (built on `i18next`)
- Excellent TypeScript support with typed translation keys
- Namespace support for splitting translations by feature/domain
- Interpolation, pluralization, context support out of the box
- Lightweight and well-suited for desktop apps

### Configuration

```typescript
// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enCommon from './locales/en/common.json';
import enHome from './locales/en/home.json';
import enIndividual from './locales/en/individual.json';
import enFamily from './locales/en/family.json';
import enEvent from './locales/en/event.json';
import enSource from './locales/en/source.json';
import enPlace from './locales/en/place.json';
import enSettings from './locales/en/settings.json';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: enCommon,
      home: enHome,
      individual: enIndividual,
      family: enFamily,
      event: enEvent,
      source: enSource,
      place: enPlace,
      settings: enSettings,
    },
  },
  defaultNS: 'common',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React already escapes
  },
});

export default i18n;
```

### Translation File Structure

```
src/i18n/
  index.ts                  # i18next initialization
  locales/
    en/
      common.json           # Shared UI strings (buttons, labels, errors)
      home.json             # Home screen
      individual.json       # Individual-related strings
      family.json           # Family-related strings
      event.json            # Event types and event-related strings
      source.json           # Source and citation strings
      place.json            # Place-related strings
      settings.json         # Settings screen
```

### Usage in Components

```typescript
import { useTranslation } from 'react-i18next';

function EventTypeSelect() {
  const { t } = useTranslation('event');

  return (
    <Select
      label={t('selectEventType')}
      data={eventTypes.map(et => ({
        value: et.id,
        label: getEventTypeDisplayName(et, t),
      }))}
    />
  );
}
```

### Locale Management

The current locale is stored in the Zustand `AppState` store and persisted:

```typescript
// src/store/app-store.ts
interface AppState {
  locale: string; // e.g., 'en', 'fr'
  setLocale: (locale: string) => void;
}

// Defaults to system locale with fallback to 'en'
const systemLocale = navigator.language.split('-')[0] || 'en';
```

### Translation Keys for Enums

All enum identifiers stored in the database are translated at the UI layer:

```json
// en/event.json
{
  "eventType": {
    "BIRT": "Birth",
    "CHR": "Christening",
    "DEAT": "Death",
    "BURI": "Burial",
    "MARR": "Marriage",
    "DIV": "Divorce"
  },
  "participantRole": {
    "principal": "Principal",
    "witness": "Witness",
    "officiant": "Officiant"
  }
}

// en/individual.json
{
  "gender": { "M": "Male", "F": "Female", "U": "Unknown" },
  "nameType": {
    "birth": "Birth name",
    "married": "Married name",
    "adopted": "Adopted name"
  }
}

// en/family.json
{
  "role": { "husband": "Husband", "wife": "Wife", "child": "Child" },
  "pedigree": {
    "birth": "Biological",
    "adopted": "Adopted",
    "foster": "Foster"
  }
}
```

---

## SQLite

### Access via Tauri Plugin

Every connection must run standard PRAGMAs after opening for performance and data integrity (see [Database Schema - Connection PRAGMAs](architecture/database-schema.md#connection-pragmas)).

```typescript
// src/db/connection.ts
import Database from '@tauri-apps/plugin-sql';

let systemDb: Database | null = null;
let treeDb: Database | null = null;

async function applyConnectionPragmas(db: Database): Promise<void> {
  await db.execute('PRAGMA journal_mode = WAL');
  await db.execute('PRAGMA synchronous = NORMAL');
  await db.execute('PRAGMA foreign_keys = ON');
  await db.execute('PRAGMA busy_timeout = 5000');
  await db.execute('PRAGMA cache_size = -20000');
  await db.execute('PRAGMA temp_store = MEMORY');
}

export async function getSystemDb(): Promise<Database> {
  if (!systemDb) {
    systemDb = await Database.load('sqlite:system.db');
    await applyConnectionPragmas(systemDb);
  }
  return systemDb;
}

export async function openTreeDb(dbPath: string): Promise<Database> {
  if (treeDb) {
    await treeDb.close();
  }
  treeDb = await Database.load(`sqlite:${dbPath}`);
  await applyConnectionPragmas(treeDb);
  return treeDb;
}

export async function getTreeDb(): Promise<Database> {
  if (!treeDb) {
    throw new Error('No tree database open');
  }
  return treeDb;
}

export async function closeTreeDb(): Promise<void> {
  if (treeDb) {
    await treeDb.close();
    treeDb = null;
  }
}
```

### Basic Operations

```typescript
// SELECT (list columns explicitly; never use SELECT *)
// id from app is formatted (e.g. I-0001); use parseEntityId for DB query
const rows = await db.select<RawIndividual[]>(
  'SELECT id, gender, is_living, notes, created_at, updated_at FROM individuals WHERE id = $1',
  [parseEntityId(id)]
);
const individual = rows[0] ? mapToIndividual(rows[0]) : null; // mapToIndividual uses formatEntityId('I', raw.id)

// INSERT
const result = await db.execute('INSERT INTO individuals (gender, is_living) VALUES ($1, $2)', [
  gender,
  isLiving ? 1 : 0,
]);
const insertedId = formatEntityId('I', result.lastInsertId);

// UPDATE
await db.execute('UPDATE individuals SET gender = $1 WHERE id = $2', [gender, parseEntityId(id)]);

// DELETE
await db.execute('DELETE FROM individuals WHERE id = $1', [parseEntityId(id)]);

// Transaction
await db.execute('BEGIN TRANSACTION');
try {
  // ... operations
  await db.execute('COMMIT');
} catch (e) {
  await db.execute('ROLLBACK');
  throw e;
}
```

---

## Development Tools

### Linting and Formatting

```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx}\"",
    "tauri": "tauri"
  }
}
```

### ESLint

```javascript
// eslint.config.js
import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': typescript,
      react: react,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
];
```

### Prettier

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

---

## Complete Dependencies

```json
// package.json
{
  "dependencies": {
    "@radix-ui/react-*": "Latest",
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-router": "^1.0.0",
    "@tauri-apps/api": "^2.0.0",
    "@tauri-apps/plugin-sql": "^2.0.0",
    "@tauri-apps/plugin-fs": "^2.0.0",
    "@tauri-apps/plugin-dialog": "^2.0.0",
    "@tauri-apps/plugin-store": "^2.0.0",
    "i18next": "^24.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-i18next": "^15.0.0",
    "zustand": "^4.0.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "class-variance-authority": "^0.7.0",
    "lucide-react": "Latest"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "eslint": "^9.0.0",
    "eslint-plugin-react": "^7.0.0",
    "eslint-plugin-react-hooks": "^4.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "@tauri-apps/cli": "^2.0.0"
  }
}
```
