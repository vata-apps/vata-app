# Database Layer Documentation

This directory contains the complete database layer for the Vata genealogy application, organized with a clean separation between system and tree databases.

## 🏗️ Architecture Overview

```
src/db/
├── types.ts                        # TypeScript interfaces (string IDs)
├── index.ts                        # Main exports
│
├── system/                         # System database (system.db)
│   ├── connection.ts               # withSystemDb()
│   ├── schema.ts                  # SQL schema constants
│   ├── init.ts                    # initializeSystemDatabase()
│   └── tables/                    # System table operations
│       ├── trees.ts               # Trees CRUD
│       └── settings.ts            # App settings CRUD
│
└── trees/                         # Individual tree databases
    ├── connection.ts              # withTreeDbById()
    ├── schema.ts                  # SQL schema + default data
    ├── init.ts                    # initializeTreeDatabase()
    └── tables/                    # Genealogy table operations
        ├── place_types.ts         # Place types CRUD
        ├── places.ts              # Places CRUD
        ├── individuals.ts         # Individuals CRUD
        ├── names.ts               # Names CRUD
        ├── event_types.ts         # Event types CRUD
        ├── event_roles.ts         # Event roles CRUD
        ├── events.ts              # Events CRUD
        └── event_participants.ts  # Event participants CRUD
```

## 📦 Import Aliases

The project uses precise TypeScript path aliases for maximum clarity:

### Available Aliases

- `$/*` → `src/*` (general src access)
- `$lib/*` → `src/lib/*` (library modules)
- `$db` → `src/db` (main database module)
- `$db/*` → `src/db/*` (database submodules)
- `$db-system` → `src/db/system` (system database)
- `$db-system/*` → `src/db/system/*` (system submodules)
- `$db-tree` → `src/db/trees` (tree databases)
- `$db-tree/*` → `src/db/trees/*` (tree submodules)

### Usage Examples

```typescript
// 🔥 RECOMMENDED: Main imports (most common)
import { system, trees } from "$db";
import type { Tree, Individual, Event } from "$db";

// ⚡ SPECIFIC: Direct table access (performance)
import { createTree } from "$db-system/tables/trees";
import { createIndividual } from "$db-tree/tables/individuals";

// 🛠️ UTILITIES: Connection-level access
import { withSystemDb } from "$db-system/connection";
import { withTreeDbById } from "$db-tree/connection";

// 📚 OTHER MODULES
import { useTheme } from "$lib/theme";
import App from "$/App";

// ❌ Old way (still works, but verbose)
import { system, trees } from "../../db";
import type { Tree, Individual, Event } from "../../db/types";
```

## 🚀 Quick Start

### 1. System Setup

```typescript
import { system } from "$db";

// Initialize system database
await system.initializeSystemDatabase();

// Create a tree
const tree = await system.trees.createTree({
  name: "Smith Family",
  description: "Our family genealogy",
});

// Manage settings
await system.settings.setSetting("theme", "dark");
const theme = await system.settings.getSetting("theme");
```

### 2. Tree Operations

```typescript
import { trees } from "$db";

// Initialize tree database
await trees.initializeTreeDatabase(tree.id);

// Create genealogy data
const individual = await trees.individuals.createIndividual(tree.id, {
  gender: "male",
});

const name = await trees.names.createName(tree.id, {
  individual_id: individual.id,
  type: "birth",
  first_name: "John",
  last_name: "Smith",
  is_primary: true,
});
```

### 3. Advanced Usage

```typescript
import { trees } from "$db";

// Get all individuals with their primary names
const individuals = await trees.individuals.getAllIndividuals(treeId);
const individualsWithNames = await Promise.all(
  individuals.map(async (individual) => {
    const primaryName = await trees.names.getPrimaryNameByIndividualId(
      treeId,
      individual.id,
    );
    return { ...individual, primaryName };
  }),
);

// Create a complete birth event
const placeType = await trees.placeTypes.createPlaceType(treeId, {
  name: "Hospital",
  key: "hospital",
});

const birthPlace = await trees.places.createPlace(treeId, {
  name: "Montreal General Hospital",
  type_id: placeType.id,
});

const eventType = await trees.eventTypes.getEventTypeByKey(treeId, "birth");
const birthEvent = await trees.events.createEvent(treeId, {
  type_id: eventType!.id,
  date: "1985-03-15",
  place_id: birthPlace.id,
});

const subjectRole = await trees.eventRoles.getEventRoleByKey(treeId, "subject");
await trees.eventParticipants.createEventParticipant(treeId, {
  event_id: birthEvent.id,
  individual_id: individual.id,
  role_id: subjectRole!.id,
});
```

## 🔧 Key Features

### String ID Interface

- All IDs are **strings** in the public API
- Automatically converted to **integers** internally for SQLite
- Type-safe with full TypeScript support

### Comprehensive CRUD

- **Create**: Insert new records
- **Read**: Multiple query variants (getAll, getById, getByForeignKey)
- **Update**: Partial updates with validation
- **Delete**: Safe deletion with foreign key handling

### JSDoc Documentation

- Every function has complete JSDoc
- Parameter descriptions and return types
- Usage examples where helpful

### Database Connections

- **System DB**: `withSystemDb()` for global app data
- **Tree DBs**: `withTreeDbById(treeId)` for genealogy data
- Connection pooling and error handling

### Default Data Seeding

- Automatic seeding of place types, event types, and event roles
- Consistent baseline data across all trees

## 📁 File Organization

- **Infrastructure**: Connection, schema, init files
- **Tables**: CRUD operations organized by database table
- **Types**: Centralized TypeScript interfaces
- **Examples**: Usage demonstrations

## 🎯 Import Pattern Examples

### Main Imports (Recommended)

```typescript
import { system, trees } from "$db";
import type { Tree, Individual, Event } from "$db";

// Most common usage
await system.initializeSystemDatabase();
const tree = await system.trees.createTree({ name: "My Tree" });
await trees.initializeTreeDatabase(tree.id);
```

### Specific Table Imports (Performance)

```typescript
import { createTree, getAllTrees } from "$db-system/tables/trees";
import { createIndividual } from "$db-tree/tables/individuals";

// Direct table access for better tree-shaking
const tree = await createTree({ name: "Performance Tree" });
const individual = await createIndividual(tree.id, { gender: "male" });
```

### Connection Utilities (Advanced)

```typescript
import { withSystemDb } from "$db-system/connection";
import { withTreeDbById } from "$db-tree/connection";

// Custom SQL queries
const trees = await withSystemDb((db) =>
  db.select("SELECT * FROM trees WHERE name LIKE ?", ["%Family%"]),
);

const individuals = await withTreeDbById(treeId, (db) =>
  db.select("SELECT * FROM individuals WHERE gender = ?", ["female"]),
);
```
