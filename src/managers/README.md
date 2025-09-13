# Business Managers

This directory contains the business logic layer that orchestrates complex operations across multiple database tables.

## 🎯 Purpose

Managers handle **business workflows** that involve multiple steps or side effects, while keeping the database layer pure (CRUD only).

## 📁 Structure

```
src/managers/
├── tree-manager.ts       # Tree business operations
├── individual-manager.ts # Individual business operations (future)
├── family-manager.ts     # Family business operations (future)
└── index.ts             # Re-exports
```

## 🌳 Tree Manager

### Functions

#### `createNewTree(input: CreateTreeInput): Promise<Tree>`

Creates a complete family tree with all necessary setup:

- Creates tree record in system database
- Initializes physical tree database
- Seeds default data (place types, event types, event roles)
- Handles rollback on failure

#### `updateTree(treeId: string, input: UpdateTreeInput): Promise<Tree>`

Updates an existing tree's metadata in the system database.
**Special behavior**: If the tree name changes, also renames the physical database file to match.

#### `deleteCompleteTree(treeId: string): Promise<void>`

Deletes a tree completely:

- Deletes the physical database file
- Removes tree record from system database

### Usage Examples

```typescript
import { treeManager } from "$managers";

// Create a new complete tree
try {
  const tree = await treeManager.createNewTree({
    name: "Smith Family Tree",
    description: "Our complete family genealogy",
  });

  console.log(`Created tree: ${tree.name} (ID: ${tree.id})`);

  // Tree is ready to use immediately!
  // The physical database is created and seeded with default data
} catch (error) {
  console.error("Failed to create tree:", error.message);
  // Tree record is automatically rolled back on failure
}

// Update tree metadata
const updatedTree = await treeManager.updateTree(tree.id, {
  description: "Updated description",
});

// Update tree name (also renames physical DB file)
const renamedTree = await treeManager.updateTree(tree.id, {
  name: "Johnson Family Tree",
});
// Physical file: smith_family.db -> johnson_family_tree.db

// Delete complete tree
await treeManager.deleteCompleteTree(tree.id);
```

## 🔄 Error Handling

Managers include proper error handling and rollback mechanisms:

```typescript
// If database initialization fails during tree creation:
// 1. The tree record is automatically deleted from system database
// 2. An error is thrown with details
// 3. No partial state is left in the system
```

## 🎯 Design Principles

1. **Pure Database Layer**: Database functions only do CRUD operations
2. **Business Logic Here**: Managers orchestrate complex workflows
3. **Error Safety**: Proper rollback on failures
4. **Single Responsibility**: Each manager handles one domain
5. **Functional Style**: Functions instead of classes for simplicity

## 📦 Import Aliases

```typescript
// Main manager imports
import { treeManager } from "$managers";

// Individual function imports (for better tree-shaking)
import { createNewTree, updateTree } from "$managers/tree-manager";
```
