# Phase 1: Setup

## Objective

Initialize the Tauri project, configure development tools, install dependencies, and establish the folder structure.

## Step 1.1: Tauri Project Initialization

### Tasks

1. **Create the Tauri project**

   ```bash
   npm create tauri-app@latest vata-app -- --template react-ts
   cd vata-app
   ```

2. **Initial structure generated**

   ```
   vata-app/
   ├── src/                    # Frontend React
   │   ├── App.tsx
   │   ├── main.tsx
   │   └── ...
   ├── src-tauri/              # Backend Rust
   │   ├── src/
   │   │   └── lib.rs
   │   ├── Cargo.toml
   │   └── tauri.conf.json
   ├── package.json
   └── vite.config.ts
   ```

3. **Verify installation**
   ```bash
   pnpm install
   pnpm tauri dev
   ```

### Validation Criteria

- [x] Application starts without errors
- [x] Window displays with React content
- [x] Hot reload works

---

## Step 1.2: Project Configuration

### Tasks

1. **Configure TypeScript (tsconfig.json)**
   - Enable strict mode
   - Configure path aliases

2. **Configure Vite (vite.config.ts)**
   - Add path aliases
   - Configure for Tauri

3. **Configure ESLint**
   - TypeScript rules
   - React/Hooks rules

4. **Configure Prettier**
   - Consistent formatting

5. **package.json scripts**
   ```json
   {
     "scripts": {
       "dev": "vite",
       "build": "tsc && vite build",
       "lint": "eslint . --ext ts,tsx",
       "lint:fix": "eslint . --ext ts,tsx --fix",
       "format": "prettier --write \"src/**/*.{ts,tsx}\"",
       "format:check": "prettier --check \"src/**/*.{ts,tsx}\"",
       "tauri": "tauri",
       "tauri:dev": "tauri dev",
       "tauri:build": "tauri build"
     }
   }
   ```

### Files to Create/Modify

- `tsconfig.json`
- `vite.config.ts`
- `eslint.config.js`
- `.prettierrc`
- `.gitignore`

### Validation Criteria

- [x] `pnpm lint` passes without errors
- [x] `pnpm format:check` passes
- [x] Imports with aliases work

---

## Step 1.3: Dependency Installation

> **MVP1 scope**: No UI library or icons in MVP1. Install only State & Data, Tauri plugins, and utilities. shadcn/ui, Tailwind CSS, and Lucide React are added in MVP4.

### Main Dependencies

```bash
# State & Data
pnpm add @tanstack/react-query @tanstack/react-router
pnpm add zustand

# Tauri plugins
pnpm add @tauri-apps/api @tauri-apps/plugin-sql @tauri-apps/plugin-fs @tauri-apps/plugin-dialog @tauri-apps/plugin-store

# Utilities (gedcom-date in MVP3, clsx useful from the start)
pnpm add clsx
```

### Development Dependencies

```bash
pnpm add -D @types/react @types/react-dom
pnpm add -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
pnpm add -D eslint eslint-plugin-react eslint-plugin-react-hooks
pnpm add -D prettier
```

### Rust Configuration (src-tauri)

```bash
cd src-tauri
cargo add tauri-plugin-sql --features sqlite
cargo add tauri-plugin-fs
cargo add tauri-plugin-dialog
cargo add tauri-plugin-store
```

### Validation Criteria

- [x] All dependencies installed
- [x] No version conflicts
- [x] Build works

---

## Step 1.4: Tauri Configuration

### tauri.conf.json

```json
{
  "$schema": "https://schema.tauri.app/config/2",
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
        "minWidth": 900,
        "minHeight": 600,
        "resizable": true,
        "fullscreen": false,
        "center": true
      }
    ],
    "security": {
      "csp": "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:"
    }
  },
  "plugins": {
    "sql": {
      "preload": ["sqlite:system.db"]
    }
  }
}
```

### lib.rs (plugins)

```rust
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Validation Criteria

- [x] Application starts with plugins
- [x] No permission errors
- [x] Window title is correct

---

## Step 1.5: Folder Structure

### Create Structure

```
src/
├── components/
│   ├── common/
│   ├── individual/
│   ├── family/
│   └── layouts/
├── pages/
│   └── Home.tsx
├── hooks/
├── managers/
├── db/
│   ├── system/
│   │   └── trees.ts
│   ├── trees/
│   └── connection.ts
├── lib/
│   └── query-client.ts
├── store/
│   └── app-store.ts
├── types/
│   └── database.ts
└── main.tsx
```

### Base Files

**src/types/database.ts**

```typescript
// Base types - will be completed progressively
export type Gender = "M" | "F" | "U";

export interface Tree {
  id: string;
  name: string;
  filename: string;
  description: string | null;
  individualCount: number;
  familyCount: number;
  lastOpenedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
```

**src/lib/query-client.ts**

```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

**src/store/app-store.ts**

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  currentTreeId: string | null;
  setCurrentTree: (id: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentTreeId: null,
      setCurrentTree: (id) => set({ currentTreeId: id }),
    }),
    {
      name: "vata-app-storage",
    },
  ),
);
```

### Validation Criteria

- [x] Structure created
- [x] Imports work
- [x] No TypeScript errors

---

## Phase 1 Deliverables

### Files Created

```
src/
├── components/
│   └── (folders created)
├── pages/
├── hooks/
├── managers/
├── db/
├── lib/
│   └── query-client.ts
├── store/
│   └── app-store.ts
├── types/
│   └── database.ts
└── main.tsx

src-tauri/
├── src/
│   └── lib.rs
├── Cargo.toml
└── tauri.conf.json

Configuration files:
├── tsconfig.json
├── vite.config.ts
├── eslint.config.js
├── .prettierrc
└── package.json
```

### Final Checklist

- [x] Application starts (`pnpm tauri dev`)
- [x] No console errors
- [x] Folder structure in place
- [x] Lint and format pass
- [x] Imports with aliases work
